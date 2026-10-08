import { Container } from "@/components/layout/Container";
import { Card, Skeleton, SkeletonRegion } from "@/components/ui";
import type { AccountTab } from "./AccountTabs";

function StatCard() {
  return (
    <Card className="p-3 sm:p-4">
      <Skeleton className="h-3 w-14" />
      <Skeleton className="mt-2 h-7 w-12" />
    </Card>
  );
}

function HistorySkeletonBody() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard />
        <StatCard />
        <StatCard />
      </div>
      <ul className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i}>
            <Card className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatsSkeletonBody() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCard key={i} />
        ))}
      </div>
      <Card>
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="h-28 w-full" />
      </Card>
      <Card>
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="h-24 w-full" />
      </Card>
    </div>
  );
}

function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

/** Thân form (cài đặt học / hồ sơ) khi đã nằm trong một Card. */
function FormSkeletonBody({ fields }: { fields: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: fields }, (_, i) => (
        <FieldSkeleton key={i} />
      ))}
      <Skeleton className="h-11 w-full rounded-xl sm:w-32" />
    </div>
  );
}

function SettingsSkeletonBody() {
  return (
    <Card>
      <FormSkeletonBody fields={2} />
    </Card>
  );
}

function TabBody({ tab }: { tab: AccountTab }) {
  if (tab === "stats") return <StatsSkeletonBody />;
  if (tab === "settings") return <SettingsSkeletonBody />;
  if (tab === "profile") return <FormSkeletonBody fields={4} />;
  return <HistorySkeletonBody />;
}

/** Skeleton cho nội dung một tab (tier 2). */
export function AccountTabSkeleton({ tab, label }: { tab: AccountTab; label: string }) {
  return (
    <SkeletonRegion label={label}>
      <TabBody tab={tab} />
    </SkeletonRegion>
  );
}

/** Skeleton cho form hồ sơ nằm trong Card có sẵn. */
export function ProfileFormSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label}>
      <FormSkeletonBody fields={4} />
    </SkeletonRegion>
  );
}

/** Skeleton toàn trang /account (tier 1). */
export function AccountPageSkeleton({ label }: { label: string }) {
  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <SkeletonRegion label={label}>
        <Skeleton className="mb-3 h-5 w-36" />
        <div className="mb-6 flex items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="mb-6 flex gap-1 border-b border-ink-200">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="mb-2 h-7 w-20 rounded-md" />
          ))}
        </div>
        <TabBody tab="history" />
      </SkeletonRegion>
    </Container>
  );
}
