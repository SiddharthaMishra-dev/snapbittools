import { Link, createFileRoute } from "@tanstack/react-router";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <section className="pt-24 pb-10 px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-100 mb-6">
            <span className="text-brand-primary">SnapBit</span> Blogs
          </h1>
          <p className="text-sm md:text-lg text-gray-400 tracking-wide max-w-3xl mx-auto">
            Read practical guides on image optimization, browser-based workflows, and faster content delivery.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-4">
          {blogPosts.map((post) => (
            <article
              key={post.href}
              className="rounded-lg border border-gray-800 bg-gray-900/60 p-4 shadow-[0px_0px_2px_1px_rgba(255,255,255,0.1)_inset]"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                {/* <span className="bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-0.5 font-medium text-blue-400">
                  {post.category}
                </span> */}
                <span className="text-gray-500">{post.publishedAt}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-500">{post.readTime}</span>
              </div>

              <h2 className="text-lg md:text-xl font-semibold text-gray-100 mb-2">{post.title}</h2>
              {/* <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">{post.description}</p> */}

              <Link
                to={post.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-hover"
              >
                Read article
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}

          <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-4 text-sm text-gray-400">
            More articles are coming soon. In the meantime, you can explore all utilities in
            <span> </span>
            <Link to="/tools" className="text-brand-primary hover:text-brand-hover font-semibold">
              All Tools
            </Link>
            .
          </div>
        </div>
      </section>
    </div>
  );
}
