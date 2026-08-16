import { createFileRoute, Link } from "@tanstack/react-router";

import LegalPage from "@/components/LegalPage";
import { getSeoMetadata } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    getSeoMetadata({
      title: "Terms of Use | SnapBit Tools",
      description:
        "Terms for using SnapBit Tools: free browser-based utilities provided as-is, with no file uploads to our servers and no account required.",
      keywords: ["snapbit terms", "snapbit terms of use", "free online tools terms"],
      url: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="16 August 2026"
    >
      <p>
        These terms govern your use of SnapBit Tools at{" "}
        <a href="https://snapbittools.com">snapbittools.com</a>, operated by Siddhartha Mishra. By
        using the site, you agree to them. If you do not agree, do not use the tools.
      </p>

      <section>
        <h2>The service</h2>
        <p>
          SnapBit Tools provides free, browser-based utilities (image conversion and compression,
          JSON and CSV tools, and similar helpers). Processing happens on your device. You do not
          need an account. Features may change, move, or be withdrawn at any time.
        </p>
      </section>

      <section>
        <h2>Your responsibilities</h2>
        <ul>
          <li>Use the tools only with files and data you have the right to process.</li>
          <li>Do not attempt to disrupt, overload, or reverse-engineer the site in a way that harms others.</li>
          <li>
            Do not use the tools for unlawful content or to violate another person&apos;s rights.
          </li>
          <li>
            You are responsible for keeping copies of important files. The tools are not a backup
            service.
          </li>
        </ul>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          How we handle analytics, hosting logs, and on-device storage is described in the{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>. File contents processed in a tool are not
          uploaded to SnapBit servers.
        </p>
      </section>

      <section>
        <h2>Open source</h2>
        <p>
          The project is released under the MIT License. Source is available on{" "}
          <a
            href="https://github.com/SiddharthaMishra-dev/js-dev-tools"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          . Third-party libraries (for example image codecs, PDF libraries, and the background-removal
          model) remain under their own licenses.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          The site and tools are provided <strong>&quot;as is&quot;</strong> and{" "}
          <strong>&quot;as available&quot;</strong>, without warranties of any kind, including
          fitness for a particular purpose, non-infringement, or uninterrupted availability.
          Conversion quality, compression ratios, and browser compatibility can vary. Always review
          the output before you rely on it.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Siddhartha Mishra and SnapBit Tools are not liable
          for any indirect, incidental, special, consequential, or punitive damages, or for lost
          data, profits, or business, arising from your use of the site. If a jurisdiction does not
          allow some of these limits, they apply to the fullest extent it does allow.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update these terms by posting a new version on this page with a revised date.
          Continued use after an update constitutes acceptance of the new terms.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          <a
            href="https://sidme.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            sidme.dev
          </a>{" "}
          or{" "}
          <a
            href="https://github.com/SiddharthaMishra-dev/js-dev-tools"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
