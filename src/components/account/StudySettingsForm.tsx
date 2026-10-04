"use client";

import { useState, type FormEvent } from "react";
import { FormError } from "@/components/auth/FormError";
import { Button, Input } from "@/components/ui";
import { useT } from "@/i18n/client";
import { api } from "@/lib/api";
import { DAILY_GOAL_MAX, DAILY_GOAL_MIN } from "@/lib/validators";
import { PushDeviceControl } from "./PushDeviceControl";
import { FormSuccess } from "./FormSuccess";

export function StudySettingsForm({
  dailyGoal,
  pushReminders,
}: {
  dailyGoal: number;
  pushReminders: boolean;
}) {
  const t = useT("account");
  const tc = useT("common");
  const [goal, setGoal] = useState(String(dailyGoal));
  const [reminders, setReminders] = useState(pushReminders);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [fieldError, setFieldError] = useState<string>();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    const n = Number(goal);
    if (!Number.isInteger(n) || n < DAILY_GOAL_MIN || n > DAILY_GOAL_MAX) {
      setFieldError(t("studySettings.dailyGoalError", { min: DAILY_GOAL_MIN, max: DAILY_GOAL_MAX }));
      return;
    }
    setFieldError(undefined);
    setPending(true);
    try {
      const saved = await api.updateStudySettings({ dailyGoal: n, pushReminders: reminders });
      setGoal(String(saved.dailyGoal));
      setReminders(saved.pushReminders);
      setSuccess(t("studySettings.saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("studySettings.saveFailed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={error} />
      <FormSuccess message={success} />
      <Input
        label={t("studySettings.dailyGoal", { min: DAILY_GOAL_MIN, max: DAILY_GOAL_MAX })}
        name="dailyGoal"
        type="number"
        inputMode="numeric"
        min={DAILY_GOAL_MIN}
        max={DAILY_GOAL_MAX}
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        error={fieldError}
      />
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-ink-800">
        <input
          type="checkbox"
          checked={reminders}
          onChange={(e) => setReminders(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-brand-600"
        />
        <span>
          <span className="font-medium">{t("studySettings.reminders")}</span>
          <span className="block text-ink-500">
            {t("studySettings.remindersHint")}
          </span>
        </span>
      </label>
      <PushDeviceControl />
      <Button type="submit" loading={pending} className="w-full sm:w-auto sm:self-start">
        {pending ? tc("saving") : t("studySettings.save")}
      </Button>
    </form>
  );
}
