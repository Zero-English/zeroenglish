import { Metadata } from "next";
import { getAllWords } from "@/lib/data";
import { ProfileTabs } from "@/components/profile-words";
import { ProfileGuard } from "@/components/profile-guard";
import { ProfileAuthBanner } from "@/components/profile-auth-banner";
import { ProfileCard } from "@/components/profile-card";
import { StaggerContainer } from "@/components/stagger";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
    title: "My Profile",
    description: "Track your vocabulary learning progress.",
};

export default async function ProfilePage() {
    const words = await getAllWords();

    return (
        <div className="relative min-h-dvh overflow-hidden">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
            <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

            <div className="relative px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <BackButton />
                    <div className="mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            My Profile
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            Track your learning progress and manage your words.
                        </p>
                    </div>

                    <ProfileGuard>
                      <StaggerContainer>
                        <ProfileAuthBanner />
                        <ProfileCard />
                        <ProfileTabs words={words} />
                      </StaggerContainer>
                    </ProfileGuard>
                </div>
            </div>
        </div>
    );
}
