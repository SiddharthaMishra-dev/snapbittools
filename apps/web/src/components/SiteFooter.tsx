import { Link } from "@tanstack/react-router";

export default function SiteFooter() {
  return (
    <footer className="mt-auto pb-8 px-4 relative z-10 bg-theme-page border-t border-theme-border">
      <div className="max-w-4xl mx-auto text-center pt-8 space-y-3">
        <nav
          aria-label="Legal"
          className="flex items-center justify-center gap-4 text-xs"
        >
          <Link
            to="/privacy-policy"
            className="text-theme-muted hover:text-brand-primary transition-colors no-underline"
          >
            Privacy Policy
          </Link>
          <span
            className="text-theme-subtle"
            aria-hidden="true"
          >
            ·
          </span>
          <Link
            to="/terms"
            className="text-theme-muted hover:text-brand-primary transition-colors no-underline"
          >
            Terms of Use
          </Link>
        </nav>
        <p className="text-theme-muted text-xs">
          Crafted with care by{" "}
          <a
            href="https://sidme.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:text-brand-hover transition-colors"
          >
            sidme
          </a>{" "}
          •{" "}
          <a
            href="https://github.com/SiddharthaMishra-dev/js-dev-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:text-brand-hover transition-colors"
          >
            Open Source on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
