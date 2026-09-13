import { getAllWords } from "@/lib/data";
import { HomeOrDashboard } from "@/components/home-or-dashboard";
import { getPublishedBlogsByPage } from "@/services/blog.service";


export default async function Home() {
  const words = await getAllWords();

  const postsResult = await getPublishedBlogsByPage(1, 3);
  const posts = (postsResult.success && postsResult.data ? postsResult.data : []).map((b) => ({
    slug: b.slug,
    titleBn: b.titleBn,
    titleEn: b.titleEn,
    descriptionBn: b.descriptionBn,
    descriptionEn: b.descriptionEn,
    imageUrl: b.featuredMedia?.url ?? null,
    imageAlt: b.featuredMedia?.altText || b.featuredMedia?.name || null,
    createdAt: b.createdAt.toISOString(),
  }));

  return <HomeOrDashboard words={words} posts={posts} />;
}