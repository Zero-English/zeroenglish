import { getAllWords } from "@/lib/data";
import { HomeContent } from "@/components/home-content";

export default function Home() {
  const words = getAllWords();
  return <HomeContent words={words} />;
}