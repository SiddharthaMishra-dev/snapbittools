import { createFileRoute } from "@tanstack/react-router";

import LegalPage from "@/components/LegalPage";
import { getSeoMetadata } from "@/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    getSeoMetadata({
      title: "Privacy Policy | SnapBit Tools",
      description:
        "How SnapBit Tools handles privacy: files are processed in your browser and never uploaded. What we collect with analytics, and what stays on your device.",
      keywords: ["snapbit privacy policy", "client-side privacy", "no upload tools privacy", "browser-based tools privacy"],
      url: "/privacy-policy",
    }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="16 August 2026">
      <p>
        SnapBit Tools (<a href="https://snapbittools.com">snapbittools.com</a>) is operated by Siddhartha Mishra. This policy explains what
        happens when you use the site. The core product promise is simple:{" "}
        <strong>your files are processed in your browser and are not uploaded to our servers</strong>.
      </p>

      <section>
        <h2>Files you process in the tools</h2>
        <p>
          Image conversion, compression, cropping, Base64 encoding, JSON formatting, CSV conversion, PDF compression, and similar tools run
          locally in your browser (including Web Workers where needed). File contents are not sent to SnapBit servers for processing,
          storage, or training.
        </p>
        <p>
          If you close the tab, in-memory file data is discarded with the page. We do not create accounts, and we do not ask you to sign in.
        </p>
      </section>

      <section>
        <h2>Data stored only on your device</h2>
        <ul>
          <li>
            <strong>Theme preference</strong> — saved in <code>localStorage</code> so light/dark mode persists.
          </li>
          <li>
            <strong>Color palettes</strong> — if you save palettes in the Color Palette Generator, they stay in <code>localStorage</code> on
            that browser.
          </li>
          <li>
            <strong>Background-removal model cache</strong> — the Image Background Remover downloads a machine-learning model from the
            img.ly / staticimgly.com CDN on first use, then caches it in IndexedDB and Cache Storage on your device so later runs are
            faster. That download is a model file, not your photo.
          </li>
        </ul>
      </section>

      <section>
        <h2>Information we receive as a website</h2>
        <p>Hosting the site still involves normal web traffic. We use the following:</p>
        <ul>
          <li>
            <strong>Vercel (hosting)</strong> — standard request logs such as IP address, user agent, and requested URL, used to operate,
            secure, and debug the site. We do not use these logs to inspect the contents of files you process in a tool.
          </li>
          <li>
            <strong>Google Analytics 4</strong> — on the production site only, we load GA4 (measurement ID <code>G-REM5Q61CZV</code>) to
            understand aggregate traffic: page path, approximate location, device, and browser. Analytics does not receive your uploaded
            files or the contents of JSON/CSV you paste into a tool. Development builds do not initialize Analytics.
          </li>
        </ul>
        <p>
          Google may process Analytics data under its own terms. See{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google&apos;s Privacy Policy
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Cookies and similar technologies</h2>
        <p>
          SnapBit Tools does not set a first-party cookie wall. Theme and saved palettes use <code>localStorage</code>, not cookies. Google
          Analytics may set or read cookies or similar identifiers according to Google&apos;s configuration. You can block Analytics with a
          browser extension, tracking protection, or by disabling cookies for third-party domains.
        </p>
      </section>

      <section>
        <h2>What we do not do</h2>
        <ul>
          <li>We do not sell your personal information.</li>
          <li>We do not use files you process in the tools to train models.</li>
          <li>We do not require an account or email to use the tools.</li>
          <li>We do not run advertising networks on the tools themselves.</li>
        </ul>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          The site is a general-purpose developer and design utility. It is not directed at children under 13, and we do not knowingly
          collect personal information from children.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If this policy changes in a material way, we will update the date at the top of this page. Continued use of the site after an
          update means you have read the revised policy.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about privacy:{" "}
          <a href="https://sidme.dev/" target="_blank" rel="noopener noreferrer">
            sidme.dev
          </a>{" "}
          or open an issue on{" "}
          <a href="https://github.com/SiddharthaMishra-dev/js-dev-tools" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
