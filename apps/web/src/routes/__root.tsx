import { HeadContent, Scripts, createRootRoute, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import { trackPageView } from "../lib/analytics";

import Header from "../components/Header";
import { getOrganizationSchema } from "../lib/seo";
import { ThemeProvider, themeInitScript } from "../lib/theme";

import appCss from "../styles.css?url";
import geistLatin from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import interLatin from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import { useEffect } from "react";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        title: "SnapBit Tools: Free Privacy-First Image Compressor & Data Converter | No Uploads Needed",
      },
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "description",
        content:
          "Compress images, convert to Base64, format JSON/CSV—all in-browser for total privacy. Fast, free tools for developers & designers.",
      },
      {
        name: "keywords",
        content:
          "image to base64, image converter, json formatter, image compressor, csv to xlsx, online tools, offline tools, privacy first",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://snapbittools.com/",
      },
      {
        property: "og:title",
        content: "SnapBit Tools: Free Privacy-First Image Compressor & Data Converter | No Uploads Needed",
      },
      {
        property: "og:description",
        content:
          "Compress images, convert to Base64, format JSON/CSV—all in-browser for total privacy. Fast, free tools for developers & designers.",
      },
      {
        property: "og:image",
        content: "https://snapbittools.com/og.png",
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "630",
      },
      {
        property: "og:image:alt",
        content: "SnapBit Tools",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "SnapBit Tools: Free Privacy-First Image Compressor & Data Converter | No Uploads Needed",
      },
      {
        name: "twitter:description",
        content:
          "Compress images, convert to Base64, format JSON/CSV—all in-browser for total privacy. Fast, free tools for developers & designers.",
      },
      {
        name: "twitter:image",
        content: "https://snapbittools.com/og.png",
      },
      {
        name: "theme-color",
        content: "#0f172a",
      },
      {
        name: "publisher",
        content: "SnapBit Tools",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
        sizes: "any",
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon-32x32.png",
        sizes: "32x32",
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/logo192.png",
        sizes: "192x192",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
        sizes: "180x180",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
      {
        rel: "preload",
        href: geistLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: interLatin,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(getOrganizationSchema()).replace(/</g, "\\u003c"),
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const page = useRouterState({
    select: (state) => {
      let title = "";
      for (const match of state.matches) {
        for (const meta of match.meta ?? []) {
          if (meta && "title" in meta && typeof meta.title === "string") title = meta.title;
        }
      }
      return { href: state.location.href, title };
    },
  });

  useEffect(() => {
    const view = page;
    const id = window.setTimeout(() => trackPageView(view.href, view.title), 50);
    return () => window.clearTimeout(id);
  }, [page.href, page.title]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
