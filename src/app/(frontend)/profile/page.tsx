import { Metadata } from "next";
import { getLevelStats } from "@/lib/data";
import { ProfileTabs } from "@/components/profile-words";
import { ProfileGuard } from "@/components/profile-guard";
import { ProfileAuthBanner } from "@/components/profile-auth-banner";
import { ProfileCard } from "@/components/profile-card";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileSyncTrigger } from "@/components/profile-sync-trigger";
import { StaggerContainer } from "@/components/stagger";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
    title: "My Profile",
    description: "Track your vocabulary learning progress.",
    robots: { index: false, follow: false },
};

export default async function ProfilePage() {
    const levelStats = await getLevelStats();
    const totalWords = levelStats.reduce((sum, s) => sum + s.count, 0);

    return (
        <div className="relative min-h-dvh overflow-hidden">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_-10%,#ffffff_0%,#f5f5f7_45%,#ececf0_100%)] dark:bg-[radial-gradient(120%_120%_at_50%_-10%,#18181b_0%,#101012_45%,#09090b_100%)]" />

            <div className="relative px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <ProfileSyncTrigger />
                    <BackButton />
                    <ProfileHeader />

                    <ProfileGuard>
                      <StaggerContainer>
                        <ProfileAuthBanner />
                        <ProfileCard />
                        <ProfileTabs levelStats={levelStats} totalWords={totalWords} />
                      </StaggerContainer>
                    </ProfileGuard>
                </div>
            </div>
        </div>
    );
}
