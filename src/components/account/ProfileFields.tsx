"use client";

import { useId, useState } from "react";
import { UserAvatar } from "@/components/avatar";
import { Input, LanguageCombobox } from "@/components/ui";
import type { ProfileFormState } from "@/lib/auth/types";
import {
  BIRTH_YEAR_MIN,
  GENDERS,
  GENDER_LABELS,
  ageFromBirthYear,
  currentYear,
  isGender,
  isValidBirthYear,
} from "@/lib/profile";

export type ProfileDefaults = {
  name: string;
  fullName: string;
  birthYear: string;
  nativeLanguage: string;
  /** "" = chưa chọn (tài khoản cũ) */
  gender: string;
  useGoogleAvatar: boolean;
};

/** Các trường hồ sơ dùng chung cho /welcome và trang tài khoản. */
export function ProfileFields({
  defaults,
  errors,
  googleAvatarUrl,
}: {
  defaults: ProfileDefaults;
  errors?: NonNullable<ProfileFormState>["fieldErrors"];
  /** Ảnh Google của người dùng (nếu có); quyết định có hiện nút bật/tắt ảnh hay không. */
  googleAvatarUrl?: string | null;
}) {
  const [birthYear, setBirthYear] = useState(defaults.birthYear);
  const [gender, setGender] = useState(defaults.gender);
  const [useGoogle, setUseGoogle] = useState(defaults.useGoogleAvatar);
  const year = Number(birthYear);
  const showAge = birthYear.trim() !== "" && isValidBirthYear(year);
  const genderId = useId();
  const genderError = errors?.gender?.[0];
  const currentGender = isGender(gender) ? gender : null;

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <UserAvatar
          src={googleAvatarUrl && useGoogle ? googleAvatarUrl : null}
          gender={currentGender}
          size={88}
        />
        {googleAvatarUrl ? (
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-ink-700">
            <input
              type="checkbox"
              name="useGoogleAvatar"
              checked={useGoogle}
              onChange={(e) => setUseGoogle(e.target.checked)}
              className="size-5 accent-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            />
            Dùng ảnh từ Google
          </label>
        ) : (
          <input type="hidden" name="useGoogleAvatar" value="on" />
        )}
      </div>
      <Input
        label="Tên hiển thị"
        name="name"
        autoComplete="nickname"
        maxLength={40}
        required
        defaultValue={defaults.name}
        error={errors?.name?.[0]}
      />
      <Input
        label="Họ và tên"
        name="fullName"
        autoComplete="name"
        maxLength={80}
        required
        defaultValue={defaults.fullName}
        error={errors?.fullName?.[0]}
      />
      <fieldset
        className="flex flex-col gap-1.5"
        aria-describedby={genderError ? `${genderId}-error` : undefined}
      >
        <legend className="mb-1.5 text-sm font-medium text-ink-700">Giới tính</legend>
        <div className="grid grid-cols-3 gap-2">
          {GENDERS.map((g) => (
            <label key={g} className="relative cursor-pointer">
              <input
                type="radio"
                name="gender"
                value={g}
                required
                checked={gender === g}
                onChange={() => setGender(g)}
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center justify-center rounded-xl border border-ink-200 bg-surface px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:font-semibold peer-checked:text-brand-800 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600">
                {GENDER_LABELS[g]}
              </span>
            </label>
          ))}
        </div>
        {genderError && (
          <p id={`${genderId}-error`} role="alert" className="text-sm text-red-600">
            {genderError}
          </p>
        )}
      </fieldset>
      <div className="flex flex-col gap-1.5">
        <Input
          label="Năm sinh"
          name="birthYear"
          type="number"
          inputMode="numeric"
          min={BIRTH_YEAR_MIN}
          max={currentYear()}
          step={1}
          required
          placeholder="VD: 2000"
          defaultValue={defaults.birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          error={errors?.birthYear?.[0]}
        />
        {showAge && (
          <p className="text-sm text-ink-600" aria-live="polite">
            ≈ {ageFromBirthYear(year)} tuổi
          </p>
        )}
      </div>
      <LanguageCombobox
        name="nativeLanguage"
        label="Ngôn ngữ mẹ đẻ"
        defaultValue={defaults.nativeLanguage}
        error={errors?.nativeLanguage?.[0]}
      />
    </>
  );
}
