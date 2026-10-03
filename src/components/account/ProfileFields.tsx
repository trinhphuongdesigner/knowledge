"use client";

import { useState } from "react";
import { Input, LanguageCombobox } from "@/components/ui";
import type { ProfileFormState } from "@/lib/auth/types";
import { BIRTH_YEAR_MIN, ageFromBirthYear, currentYear, isValidBirthYear } from "@/lib/profile";

export type ProfileDefaults = { name: string; fullName: string; birthYear: string; nativeLanguage: string };

/** Các trường hồ sơ dùng chung cho /welcome và trang tài khoản. */
export function ProfileFields({
  defaults,
  errors,
}: {
  defaults: ProfileDefaults;
  errors?: NonNullable<ProfileFormState>["fieldErrors"];
}) {
  const [birthYear, setBirthYear] = useState(defaults.birthYear);
  const year = Number(birthYear);
  const showAge = birthYear.trim() !== "" && isValidBirthYear(year);

  return (
    <>
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
