import { Link, createFileRoute } from "@tanstack/react-router";

import PageShell from "@/components/PageShell";
import { getSeoMetadata } from "@/lib/seo";
import { blogPosts } from "@/data/blogs";

export const Route = createFileRoute("/blogs")({
  head: () =>
    getSeoMetadata({
      title: "Blogs | SnapBit Tools",
      description: "Browse SnapBit Tools blog articles on image optimization, performance, and privacy-first workflows.",
      keywords: ["snapbit blogs", "image optimization blog", "web performance blog", "privacy-first tools"],
      url: "/blogs",
      type: "website",
    }),
  component: BlogsPage,
});

function BlogsPage() {
  return (
    <PageShell>
      <section className="pt-28 pb-10 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-theme-heading mb-6">
            <span className="text-brand-primary">SnapBit</span> Blogs
          </h1>
          <p className="text-sm md:text-lg text-theme-muted tracking-wide max-w-3xl mx-auto">
            Read practical guides on image optimization, browser-based workflows, and faster content delivery.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-4">
          {blogPosts.map((post) => (
            <article
              key={post.href}
              className="rounded-lg border border-theme-border bg-theme-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                <span className="text-theme-subtle">{post.publishedAt}</span>
                <span className="text-theme-subtle">•</span>
                <span className="text-theme-subtle">{post.readTime}</span>
              </div>

              <h2 className="text-lg md:text-xl font-semibold text-theme-heading mb-2">{post.title}</h2>

              <Link
                to={post.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-hover"
              >
                Read article
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
