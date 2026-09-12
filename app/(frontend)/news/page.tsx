import type { Metadata } from "next";
import { getPublishedBlogsByPage } from "@/services/blog.service";
import { BlogCard } from "@/components/news/blog-card";
import { NewsPagination } from "@/components/news/news-pagination";

export const metadata: Metadata = {
  title: "News & Blog | Zero English",
  description:
    "Articles, tips and updates for Bangla-speaking English learners at Zero English.",
};

export const dynamic = "force-dynamic";

const PAGE_LIMIT = 9;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const result = await getPublishedBlogsByPage(page, PAGE_LIMIT);
  const blogs = result.success && result.data ? result.data : [];
  const totalPages = result.pagination?.totalPages ?? 1;
  const total = result.pagination?.total ?? 0;

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Zero English
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            News &amp; Blog
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
            Tips, updates and stories for Bangla-speaking English learners.
          </p>
        </header>

        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-24 text-center dark:border-zinc-700">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No articles published yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  slug={blog.slug}
                  titleBn={blog.titleBn}
                  titleEn={blog.titleEn}
                  descriptionBn={blog.descriptionBn}
                  descriptionEn={blog.descriptionEn}
                  imageUrl={blog.featuredMedia?.url}
                  imageAlt={
                    blog.featuredMedia?.altText ||
                    blog.featuredMedia?.name ||
                    undefined
                  }
                  createdAt={blog.createdAt}
                />
              ))}
            </div>

            {total > PAGE_LIMIT && (
              <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {total} article{total === 1 ? "" : "s"}
                </span>
                <NewsPagination page={page} totalPages={totalPages} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}