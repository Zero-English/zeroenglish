import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, AtSign, Hash, Mail } from "lucide-react";
import type { ApiUser, UserDetailResponse } from "../types";
import UserActions from "./user-actions";

export const metadata: Metadata = {
  title: "User Detail | Admin — Zero English",
};

export const dynamic = "force-dynamic";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-orange-500",
];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

async function buildBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

async function findUser(id: number): Promise<ApiUser | undefined> {
  const baseUrl = await buildBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/user/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return undefined;
  const result = (await res.json()) as UserDetailResponse;
  if (!result.success || !result.data) return undefined;
  return result.data;
}

export default async function SingleUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await findUser(Number(id));
  if (!user) notFound();

  return (
    <div className="p-6 lg:p-10">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white ${avatarColor(user.id)}`}
          >
            {(user.name || user.user_name).charAt(0)}
          </span>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {user.name || user.user_name}
              </h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.role === "admin"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {user.role}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              @{user.user_name}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
        <UserActions user={user} />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailCard icon={Hash} label="User ID" value={String(user.id)} />
        <DetailCard icon={AtSign} label="Username" value={`@${user.user_name}`} />
        <DetailCard icon={Mail} label="Email" value={user.email} />
        <DetailCard icon={AtSign} label="Role" value={user.role} />
      </section>

      <section className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Profile
          </h2>
        </div>
        <dl className="divide-y divide-gray-100 dark:divide-gray-800">
          {[
            ["Name", user.name || "—"],
            ["Username", user.user_name],
            ["Email", user.email],
            [
              "Email Verified",
              user.emailVerified ? formatDate(user.emailVerified) : "No",
            ],
            ["Role", user.role],
            ["Created", formatDate(user.created_at)],
            ["Last Updated", formatDate(user.updated_at)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between px-5 py-3 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
              <dd className="font-medium capitalize text-gray-900 dark:text-white">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof AtSign;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
