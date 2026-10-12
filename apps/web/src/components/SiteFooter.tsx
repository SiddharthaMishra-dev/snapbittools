import { blogPosts } from "@/data/blogs";
import { TOOL_CATEGORY_ORDER, toolCategories } from "@/data/tools";
import { Link } from "@tanstack/react-router";

export default function SiteFooter() {
  return (
    <footer className="mt-auto relative z-10 border-t border-theme-border bg-theme-page">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid gap-10 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 no-underline">
              <img src="/logo192.png" alt="" width={28} height={28} className="w-7 h-7" />
              <span className="text-sm font-bold text-theme-heading">SnapBit Tools</span>
            </Link>
            <p className="text-sm text-theme-muted max-w-xs">Files stay in the browser.</p>
            <a
              href="https://www.producthunt.com/products/snapbit-tools/launches/snapbit-tools?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-snapbit-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                alt="SnapBit Tools on Product Hunt"
                width={200}
                height={43}
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1125101&theme=light&t=1787815217178"
              />
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-theme-heading mb-3">Product</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tools" className="text-theme-muted hover:text-brand-primary no-underline">
                  All tools
                </Link>
              </li>
              {TOOL_CATEGORY_ORDER.map((category) => {
                const meta = toolCategories[category];
                return (
                  <li key={meta.href}>
                    <Link to={meta.href} className="text-theme-muted hover:text-brand-primary no-underline">
                      {meta.heading}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-theme-heading mb-3">
              <Link to="/blogs" className="text-theme-heading hover:text-brand-primary no-underline">
                Journal
              </Link>
            </h2>
            <ul className="space-y-2 text-sm">
              {blogPosts.map((post) => (
                <li key={post.href}>
                  <Link to={post.href} className="text-theme-muted hover:text-brand-primary no-underline line-clamp-2">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-theme-heading mb-3">Company</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/SiddharthaMishra-dev/snapbittools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-theme-muted hover:text-brand-primary"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://www.sidme.dev/" target="_blank" rel="noopener noreferrer" className="text-theme-muted hover:text-brand-primary">
                  sidme
                </a>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-theme-muted hover:text-brand-primary no-underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-theme-muted hover:text-brand-primary no-underline">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>
    </footer>
  );
}
