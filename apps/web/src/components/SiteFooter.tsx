import { Link } from "@tanstack/react-router";

export default function SiteFooter() {
  return (
    <footer className="mt-auto pb-8 px-4 relative z-10 bg-theme-page border-t border-theme-border">
      <div className="max-w-4xl mx-auto text-center pt-8 space-y-3">
        <nav aria-label="Tools" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          <Link to="/tools" className="text-theme-muted hover:text-brand-primary transition-colors no-underline">
            All Tools
          </Link>
          <Link to="/image-tools" className="text-theme-muted hover:text-brand-primary transition-colors no-underline">
            Image Tools
          </Link>
          <Link to="/pdf-tools" className="text-theme-muted hover:text-brand-primary transition-colors no-underline">
            PDF Tools
          </Link>
          <Link to="/data-tools" className="text-theme-muted hover:text-brand-primary transition-colors no-underline">
            Data Tools
          </Link>
          <Link to="/utility-tools" className="text-theme-muted hover:text-brand-primary transition-colors no-underline">
            Utility Tools
          </Link>
        </nav>
        <nav aria-label="Legal" className="flex items-center justify-center gap-4 text-xs">
          <Link to="/privacy-policy" className="text-theme-muted hover:text-brand-primary transition-colors no-underline">
            Privacy Policy
          </Link>
          <span className="text-theme-subtle" aria-hidden="true">
            ·
          </span>
          <Link to="/terms" className="text-theme-muted hover:text-brand-primary transition-colors no-underline">
            Terms of Use
          </Link>
        </nav>
        <div className="flex justify-center pt-1">
          <a
            href="https://www.producthunt.com/products/snapbit-tools/launches/snapbit-tools?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-snapbit-tools"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="SnapBit Tools - Fast,Free & Private Image and Data Processing Tools. | Product Hunt"
              width={250}
              height={54}
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1125101&theme=light&t=1787815217178"
            />
          </a>
        </div>
        <p className="text-theme-muted text-xs">
          Crafted with care by{" "}
          <a
            href="https://www.sidme.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:text-brand-hover transition-colors"
          >
            sidme
          </a>{" "}
          •{" "}
          <a
            href="https://github.com/SiddharthaMishra-dev/snapbittools"
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
