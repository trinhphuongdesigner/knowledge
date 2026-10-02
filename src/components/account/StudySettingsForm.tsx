"use client";

import { useState, type FormEvent } from "react";
import { FormError } from "@/components/auth/FormError";
import { Button, Input } from "@/components/ui";
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
      setFieldError(`Nhập số nguyên từ ${DAILY_GOAL_MIN} đến ${DAILY_GOAL_MAX}`);
      return;
    }
    setFieldError(undefined);
    setPending(true);
    try {
      const saved = await api.updateStudySettings({ dailyGoal: n, pushReminders: reminders });
      setGoal(String(saved.dailyGoal));
      setReminders(saved.pushReminders);
      setSuccess("Đã lưu cài đặt học");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được cài đặt");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={error} />
      <FormSuccess message={success} />
      <Input
        label={`Mục tiêu mỗi ngày (${DAILY_GOAL_MIN}–${DAILY_GOAL_MAX} thẻ)`}
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
          <span className="font-medium">Nhắc học bằng thông báo đẩy</span>
          <span className="block text-ink-500">
            Gửi tối đa 1 thông báo/ngày (khoảng 19:00) khi bạn chưa học và còn thẻ cần ôn. Thông báo cũng hiện ở biểu tượng chuông.
          </span>
        </span>
      </label>
      <PushDeviceControl />
      <Button type="submit" loading={pending} className="w-full sm:w-auto sm:self-start">
        {pending ? "Đang lưu…" : "Lưu cài đặt"}
      </Button>
    </form>
  );
}
