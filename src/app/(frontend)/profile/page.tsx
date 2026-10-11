import { Metadata } from "next";
import { getLevelStats, getLevelWordIdMap } from "@/lib/data";
import { ProfileTabs } from "@/components/profile-words";
import { ProfileGuard } from "@/components/profile-guard";
import { ProfileAuthBanner } from "@/components/profile-auth-banner";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileSyncTrigger } from "@/components/profile-sync-trigger";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Track your vocabulary learning progress with interactive analytics and mastery decks.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const [levelStats, levelWordMap] = await Promise.all([
    getLevelStats(),
    getLevelWordIdMap(),
  ]);
  const totalWords = levelStats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div className="relative px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto w-full min-w-0">
          <ProfileSyncTrigger />
          <ProfileHeader />

          <ProfileGuard>
            <ProfileAuthBanner />
            <ProfileTabs
              levelStats={levelStats}
              totalWords={totalWords}
              levelWordMap={levelWordMap}
            />
          </ProfileGuard>
        </div>
      </div>
    </div>
  );
}
