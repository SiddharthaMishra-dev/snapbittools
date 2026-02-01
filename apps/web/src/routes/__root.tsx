import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import ReactGA from "react-ga4";

import Header from "../components/Header";

import appCss from "../styles.css?url";
import { useEffect } from "react";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        title: "JS DevTools | Privacy First | 100% Private and Fast Utilities",
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
          "Free, private, and fast everyday tools. Convert images to Base64, compress, crop, and convert formats, format JSON and convert image to pdf instantly. 100% client-side—your data never leaves your browser.",
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
        content: "https://js-devtools.sidme.dev/",
      },
      {
        property: "og:title",
        content: "JS DevTools | Privacy First | 100% Private and Fast Utilities",
      },
      {
        property: "og:description",
        content:
          "Free, private, and fast tools. 100% client-side—your data never leaves your browser.",
      },
      {
        property: "og:image",
        content: "https://js-devtools.sidme.dev/og.png",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "JS DevTools | Privacy First | 100% Client-Side Utilities",
      },
      {
        name: "twitter:description",
        content:
          "Free, private, and fast tools. 100% client-side—your data never leaves your browser.",
      },
      {
        name: "twitter:image",
        content: "https://js-devtools.sidme.dev/og.png",
      },
      {
        name: "theme-color",
        content: "#0f172a",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        {children}
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
