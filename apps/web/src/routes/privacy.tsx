import { createFileRoute, redirect } from "@tanstack/react-router";

// Not prerendered. A static copy would follow this redirect and ship as HTTP 200.
export const Route = createFileRoute("/privacy")({
  beforeLoad: () => {
    throw redirect({
      to: "/privacy-policy",
      replace: true,
      statusCode: 301,
    });
  },
  component: () => null,
});
