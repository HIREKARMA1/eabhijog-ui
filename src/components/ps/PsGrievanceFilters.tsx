"use client";

import { useRouter } from "next/navigation";

import { Select } from "@/components/ui/Select";
import type { MetadataConstants } from "@/types/api";

type Props = {
  basePath: string;
  constants: MetadataConstants;
  current: Record<string, string>;
};

export function PsGrievanceFilters({ basePath, constants, current }: Props) {
  const router = useRouter();

  function update(key: string, value: string) {
    const params = new URLSearchParams(current);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-surface-muted/50 p-4">
      <Select
        value={current.date_preset || ""}
        onChange={(e) => update("date_preset", e.target.value)}
        className="min-w-[140px]"
      >
        <option value="">All dates</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="last_7_days">Last 7 Days</option>
        <option value="last_30_days">Last 30 Days</option>
      </Select>
      <Select
        value={current.category || ""}
        onChange={(e) => update("category", e.target.value)}
        className="min-w-[160px]"
      >
        <option value="">All categories</option>
        {constants.grievance_categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      <Select
        value={current.osd_category || ""}
        onChange={(e) => update("osd_category", e.target.value)}
        className="min-w-[160px]"
      >
        <option value="">All OSDs</option>
        {constants.osd_categories.map((c) => (
          <option key={c} value={c}>
            OSD {c}
          </option>
        ))}
      </Select>
      <Select
        value={current.status || ""}
        onChange={(e) => update("status", e.target.value)}
        className="min-w-[160px]"
      >
        <option value="">All statuses</option>
        {constants.ps_status_buckets.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </Select>
      <Select
        value={current.district || ""}
        onChange={(e) => update("district", e.target.value)}
        className="min-w-[140px]"
      >
        <option value="">All districts</option>
        {constants.districts.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Select>
      <Select
        value={current.constituency || ""}
        onChange={(e) => update("constituency", e.target.value)}
        className="min-w-[140px]"
      >
        <option value="">All constituencies</option>
        {constants.constituencies.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      <Select
        value={current.priority || ""}
        onChange={(e) => update("priority", e.target.value)}
        className="min-w-[120px]"
      >
        <option value="">All priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </Select>
    </div>
  );
}
