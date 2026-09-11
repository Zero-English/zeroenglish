import { getAllWords } from "@/lib/data";
import { HomeOrDashboard } from "@/components/home-or-dashboard";

export default async function Home() {
  const words = await getAllWords();
  return <HomeOrDashboard words={words} />;
}