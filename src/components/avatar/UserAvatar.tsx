"use client";

import { useState } from "react";
import type { Gender } from "@/lib/profile";
import { DefaultAvatar } from "./DefaultAvatars";

export function UserAvatar({
  src,
  gender,
  name,
  size = 40,
  className = "",
}: {
  src?: string | null;
  gender?: Gender | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  // Track which src failed so the error state resets automatically when src changes.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = !!src && failedSrc !== src;

  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-ink-200 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ? `Ảnh đại diện của ${name}` : "Ảnh đại diện"}
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <DefaultAvatar
          gender={gender}
          size={size}
          className="block h-full w-full"
          decorative={!!name}
        />
      )}
    </span>
  );
}
