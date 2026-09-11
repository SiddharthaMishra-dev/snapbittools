import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import ReactGA from "react-ga4";

import Header from "../components/Header";
import { getOrganizationSchema } from "../lib/seo";
import { SidebarProvider } from "../lib/sidebar";
import { ThemeProvider, themeInitScript } from "../lib/theme";

import appCss from "../styles.css?url";
import googleSansLatin from "@fontsource-variable/google-sans/files/google-sans-latin-wght-normal.woff2?url";
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
        href: googleSansLatin,
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
  useEffect(() => {
    if (import.meta.env.DEV) return;
    ReactGA.initialize("G-REM5Q61CZV");
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <Header />
            {children}
          </SidebarProvider>
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
