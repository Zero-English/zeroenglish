import { getAllWords } from "@/lib/data";
import { HomeContent } from "@/components/home-content";

export default async function Home() {
  const words = await getAllWords();
  return <HomeContent words={words} />;
}