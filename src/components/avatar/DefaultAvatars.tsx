"use client";

import { useId, type ReactNode } from "react";
import { useT } from "@/i18n/client";
import type { Gender } from "@/lib/profile";

export type DefaultAvatarProps = {
  size?: number;
  className?: string;
  /** Hide from assistive tech (use when a name is rendered next to it). */
  decorative?: boolean;
};

type FrameProps = DefaultAvatarProps & {
  label: string;
  bg: string;
  children: ReactNode;
};

/** Shared square frame: background circle + clip so art never leaks outside. */
function Frame({
  size = 40,
  className,
  decorative,
  label,
  bg,
  children,
}: FrameProps) {
  const clipId = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={className}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": label })}
    >
      {decorative ? null : <title>{label}</title>}
      <defs>
        <clipPath id={clipId}>
          <circle cx="64" cy="64" r="64" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="64" cy="64" r="64" fill={bg} />
        {children}
      </g>
    </svg>
  );
}

export function BoyAvatar(props: DefaultAvatarProps) {
  const t = useT("account");
  return (
    <Frame
      {...props}
      label={t("avatar.male")}
      bg="#bfe2ff"
    >
      {/* shirt + neck */}
      <path d="M14 134c0-22 18-34 50-34s50 12 50 34z" fill="#4f9de8" />
      <path d="M50 100c4 8 24 8 28 0z" fill="#3b83cc" />
      <rect x="55" y="86" width="18" height="18" rx="6" fill="#f0b088" />
      {/* ears */}
      <circle cx="35" cy="70" r="6" fill="#f0b088" />
      <circle cx="93" cy="70" r="6" fill="#f0b088" />
      {/* head */}
      <circle cx="64" cy="66" r="30" fill="#ffd2ac" />
      {/* hair */}
      <path
        d="M33 62c-4-20 8-36 28-38l-3-10 9 7 6-9 3 10 10-4-2 10c10 6 16 18 13 34-3-8-8-14-14-17-12 4-30 4-42-2-4 3-7 7-8 19z"
        fill="#5b3a29"
      />
      <path d="M62 17c4-6 12-6 14 0-5-2-9-2-14 0z" fill="#7a5038" />
      {/* eyes */}
      <ellipse cx="52" cy="68" rx="5" ry="6" fill="#2b2230" />
      <ellipse cx="76" cy="68" rx="5" ry="6" fill="#2b2230" />
      <circle cx="54" cy="65.5" r="1.9" fill="#fff" />
      <circle cx="78" cy="65.5" r="1.9" fill="#fff" />
      {/* cheeks */}
      <ellipse cx="42" cy="78" rx="5" ry="3.4" fill="#ff9aa2" opacity="0.7" />
      <ellipse cx="86" cy="78" rx="5" ry="3.4" fill="#ff9aa2" opacity="0.7" />
      {/* smile */}
      <path d="M57 79q7 10 14 0z" fill="#b8434b" />
      <path d="M60.5 83q3.5 2.5 7 0q-3.500-1.500-7 0z" fill="#ff8a8f" />
    </Frame>
  );
}

export function GirlAvatar(props: DefaultAvatarProps) {
  const t = useT("account");
  return (
    <Frame
      {...props}
      label={t("avatar.female")}
      bg="#ffd2dc"
    >
      {/* pigtails (behind head) */}
      <circle cx="27" cy="76" r="13" fill="#7a3b2e" />
      <circle cx="101" cy="76" r="13" fill="#7a3b2e" />
      <circle cx="24" cy="72" r="4" fill="#97503f" />
      <circle cx="104" cy="72" r="4" fill="#97503f" />
      {/* dress + neck */}
      <path d="M14 134c0-22 18-34 50-34s50 12 50 34z" fill="#ff7fa0" />
      <path d="M50 100c4 8 24 8 28 0z" fill="#e9638a" />
      <rect x="55" y="86" width="18" height="18" rx="6" fill="#f0b088" />
      {/* hair back + head */}
      <circle cx="64" cy="62" r="33" fill="#7a3b2e" />
      <circle cx="64" cy="68" r="29" fill="#ffd2ac" />
      {/* fringe */}
      <path
        d="M33 62c0-20 14-30 32-30s31 10 31 30c-6-4-10-10-12-16-10 8-30 10-44 8-3 3-6 6-7 8z"
        fill="#7a3b2e"
      />
      <path d="M44 40c8-6 22-8 34-3-12-1-24 0-34 3z" fill="#97503f" />
      {/* hair ties */}
      <circle cx="31" cy="73" r="4.500" fill="#ffd34d" />
      <circle cx="97" cy="73" r="4.500" fill="#ffd34d" />
      {/* bow */}
      <path d="M64 30l-14-9c-3 6-3 12 0 17z" fill="#ff4f7b" />
      <path d="M64 30l14-9c3 6 3 12 0 17z" fill="#ff4f7b" />
      <circle cx="64" cy="30" r="4.500" fill="#d93563" />
      {/* eyes with lashes */}
      <ellipse cx="52" cy="70" rx="5" ry="6" fill="#2b2230" />
      <ellipse cx="76" cy="70" rx="5" ry="6" fill="#2b2230" />
      <circle cx="54" cy="67.500" r="1.900" fill="#fff" />
      <circle cx="78" cy="67.500" r="1.900" fill="#fff" />
      <path
        d="M48 66l-3.500-2.500M50 64.500l-2-3M80 66l3.500-2.500M78 64.500l2-3"
        fill="none"
        stroke="#2b2230"
        strokeWidth="1.600"
        strokeLinecap="round"
      />
      {/* cheeks */}
      <ellipse cx="42" cy="80" rx="5" ry="3.400" fill="#ff8f9c" opacity="0.7" />
      <ellipse cx="86" cy="80" rx="5" ry="3.400" fill="#ff8f9c" opacity="0.7" />
      {/* smile */}
      <path d="M58 81q6 8 12 0z" fill="#b8434b" />
    </Frame>
  );
}

export function AnonymousAvatar(props: DefaultAvatarProps) {
  const t = useT("account");
  return (
    <Frame
      {...props}
      label={t("avatar.anonymous")}
      bg="#d9d0ff"
    >
      {/* question-mark tuft */}
      <path
        d="M58 32c0-9 14-9 14 0 0 6-8 6-8 13"
        fill="none"
        stroke="#6f5cd6"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="64" cy="53" r="3" fill="#6f5cd6" />
      {/* hooded body */}
      <path d="M12 134c0-24 20-36 52-36s52 12 52 36z" fill="#8c79f0" />
      <circle cx="64" cy="76" r="36" fill="#8c79f0" />
      <path d="M36 98c8 8 48 8 56 0 4 2 6 4 8 6-10 8-62 8-72 0 2-2 5-4 8-6z" fill="#6f5cd6" />
      {/* face */}
      <ellipse cx="64" cy="76" rx="26" ry="23" fill="#fff1dc" />
      {/* eyes */}
      <ellipse cx="54" cy="74" rx="4.500" ry="5.500" fill="#2b2230" />
      <ellipse cx="74" cy="74" rx="4.500" ry="5.500" fill="#2b2230" />
      <circle cx="55.800" cy="71.800" r="1.700" fill="#fff" />
      <circle cx="75.800" cy="71.800" r="1.700" fill="#fff" />
      {/* cheeks */}
      <ellipse cx="45" cy="83" rx="4.500" ry="3" fill="#ff9aa2" opacity="0.7" />
      <ellipse cx="83" cy="83" rx="4.500" ry="3" fill="#ff9aa2" opacity="0.7" />
      {/* smile */}
      <path d="M58 84q6 7 12 0z" fill="#b8434b" />
    </Frame>
  );
}

export function DefaultAvatar({
  gender,
  ...props
}: DefaultAvatarProps & { gender: Gender | null | undefined }) {
  if (gender === "MALE") return <BoyAvatar {...props} />;
  if (gender === "FEMALE") return <GirlAvatar {...props} />;
  return <AnonymousAvatar {...props} />;
}
