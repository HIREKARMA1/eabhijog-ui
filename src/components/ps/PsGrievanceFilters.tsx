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
        options={[
          { value: "", label: "All dates" },
          { value: "today", label: "Today" },
          { value: "yesterday", label: "Yesterday" },
          { value: "last_7_days", label: "Last 7 Days" },
          { value: "last_30_days", label: "Last 30 Days" },
        ]}
      />
      <Select
        value={current.category || ""}
        onChange={(e) => update("category", e.target.value)}
        className="min-w-[160px]"
        options={[
          { value: "", label: "All categories" },
          ...constants.grievance_categories.map((c) => ({ value: c, label: c })),
        ]}
      />
      <Select
        value={current.osd_category || ""}
        onChange={(e) => update("osd_category", e.target.value)}
        className="min-w-[160px]"
        options={[
          { value: "", label: "All OSDs" },
          ...constants.osd_categories.map((c) => ({ value: c, label: `OSD ${c}` })),
        ]}
      />
      <Select
        value={current.status || ""}
        onChange={(e) => update("status", e.target.value)}
        className="min-w-[160px]"
        options={[
          { value: "", label: "All statuses" },
          ...constants.ps_status_buckets.map((s) => ({
            value: s,
            label: s.replace(/_/g, " "),
          })),
        ]}
      />
      <Select
        value={current.district || ""}
        onChange={(e) => update("district", e.target.value)}
        className="min-w-[140px]"
        options={[
          { value: "", label: "All districts" },
          ...constants.districts.map((d) => ({ value: d, label: d })),
        ]}
      />
      <Select
        value={current.constituency || ""}
        onChange={(e) => update("constituency", e.target.value)}
        className="min-w-[140px]"
        options={[
          { value: "", label: "All constituencies" },
          ...constants.constituencies.map((c) => ({ value: c, label: c })),
        ]}
      />
      <Select
        value={current.priority || ""}
        onChange={(e) => update("priority", e.target.value)}
        className="min-w-[120px]"
        options={[
          { value: "", label: "All priorities" },
          { value: "critical", label: "Critical" },
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low" },
        ]}
      />
    </div>
  );
}
