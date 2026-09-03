"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

interface UserAvatarProps {
  id: number;
  name?: string | null;
  userName?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-14 w-14 text-xl",
};

export function UserAvatar({
  id,
  name,
  userName,
  image,
  size = "sm",
  className = "",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [image]);

  const initial = (name || userName || "?").charAt(0).toUpperCase();
  const showImage = image && !imgError;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ${avatarColor(id)} ${sizeClasses[size]} ${className}`}
    >
      {showImage ? (
        <Image
          src={image}
          alt={name || userName || "User"}
          fill
          sizes="56px"
          unoptimized
          className="rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        initial
      )}
    </span>
  );
}
