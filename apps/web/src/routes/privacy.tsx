import { createFileRoute, redirect } from "@tanstack/react-router";

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
