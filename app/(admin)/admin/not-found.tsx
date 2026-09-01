import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileQuestion className="h-8 w-8" />
      </span>
      <p className="mt-6 text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
        The admin page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/admin/users"
        className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Back to Users
      </Link>
    </div>
  );
}
