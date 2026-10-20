import { ReactGAImplementation } from "react-ga4";

const MEASUREMENT_ID = "G-REM5Q61CZV";

let client: ReactGAImplementation | undefined;
let downloadsListening = false;

function canTrack() {
  return !import.meta.env.DEV && typeof window !== "undefined";
}

function getClient() {
  if (!client) {
    client = new ReactGAImplementation();
    client.initialize(MEASUREMENT_ID, { gtagOptions: { send_page_view: false } });
  }
  return client;
}

/** First path segment, so `/image-compressor` and its spokes stay attached to that tool. */
export function toolFromPath(pathname: string): string {
  const slug = pathname.split("?")[0]?.split("#")[0]?.replace(/^\/+|\/+$/g, "").split("/")[0];
  return slug || "home";
}

export function isDownloadControl(target: Element): boolean {
  const button = target.closest("button");
  if (!(button instanceof HTMLButtonElement) || button.disabled) return false;
  if (button.hasAttribute("data-ga-download")) return true;
  const name = `${button.getAttribute("aria-label") ?? ""} ${button.textContent ?? ""}`.replace(/\s+/g, " ").toLowerCase();
  return name.includes("download");
}

export function trackPageView(page: string, title = document.title) {
  if (!canTrack()) return;
  ensureDownloadTracking();
  getClient().send({ hitType: "pageview", page, title });
}

export function trackDownload(tool: string) {
  if (!canTrack()) return;
  getClient().event("download", { tool });
}

function ensureDownloadTracking() {
  if (downloadsListening || typeof document === "undefined") return;
  downloadsListening = true;
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element) || !isDownloadControl(target)) return;
    trackDownload(toolFromPath(window.location.pathname));
  });
}
