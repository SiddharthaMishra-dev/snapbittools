import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { fileURLToPath, URL } from "url";
import { nitro } from "nitro/vite";

import tailwindcss from "@tailwindcss/vite";
import { CANONICAL_TARGETS } from "./src/lib/seo.ts";

/** Paths that stay reachable but must not be advertised in sitemap.xml. */
const SITEMAP_EXCLUDED_PATHS = [...Object.keys(CANONICAL_TARGETS), "/privacy"];

const config = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: ["@imgly/background-removal", "onnxruntime-web"],
  },
  plugins: [
    devtools(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      pages: SITEMAP_EXCLUDED_PATHS.map((path) => ({
        path,
        sitemap: { exclude: true },
      })),
      prerender: {
        enabled: true,
        crawlLinks: true,
        // Prerender follows the 301 and writes the policy HTML at /privacy,
        // which Vercel then serves as 200. Leave it to the server redirect.
        filter: (page) => page.path.replace(/\/+$/, "") !== "/privacy",
      },
      sitemap: {
        enabled: true,
        host: "https://snapbittools.com",
      },
    }),
    nitro({
      preset: "vercel",
      routeRules: {
        "/privacy": { redirect: { to: "/privacy-policy", status: 301 } },
      },
      // A config `hooks` object replaces the Vercel preset hook that fills in `{format}`.
      // A module appends instead, so the preset entry still resolves.
      modules: [
        {
          setup(nitroApp) {
            nitroApp.hooks.hook("compiled", async () => {
              const { readFile, writeFile } = await import("node:fs/promises");
              const { resolve } = await import("node:path");
              const configPath = resolve(nitroApp.options.output.dir, "config.json");
              const config = JSON.parse(await readFile(configPath, "utf8")) as {
                routes?: Array<{ src?: string; headers?: { Location?: string } }>;
              };
              let changed = false;
              for (const route of config.routes ?? []) {
                if (route.src === "/privacy" && route.headers?.Location === "/privacy-policy") {
                  route.src = "^/privacy$";
                  changed = true;
                }
              }
              if (changed) await writeFile(configPath, JSON.stringify(config, null, 2));
            });
          },
        },
      ],
    }),
    viteReact(),
  ],
});

export default config;
