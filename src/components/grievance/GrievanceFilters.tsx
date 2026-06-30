"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useI18n } from "@/lib/i18n/context";

type GrievanceFiltersProps = {
  statuses: string[];
  districts: string[];
  basePath: string;
};

export function GrievanceFilters({ statuses, districts, basePath }: GrievanceFiltersProps) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [district, setDistrict] = useState(params.get("district") ?? "");
  const [search, setSearch] = useState(params.get("search") ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (district) qs.set("district", district);
    if (search) qs.set("search", search);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    router.push(`${basePath}${suffix}`);
  }

  function onClear() {
    setStatus("");
    setDistrict("");
    setSearch("");
    router.push(basePath);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-border bg-white p-4 md:grid-cols-4">
      <Select
        name="status"
        label={t("dashboard", "filters.status")}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={[
          { value: "", label: "—" },
          ...statuses.map((s) => ({ value: s, label: s.replace(/_/g, " ") })),
        ]}
      />
      <Select
        name="district"
        label={t("dashboard", "filters.district")}
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        options={[{ value: "", label: "—" }, ...districts.map((d) => ({ value: d, label: d }))]}
      />
      <Input
        name="search"
        label={t("dashboard", "filters.search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex items-end gap-2">
        <Button type="submit" className="flex-1">
          {t("dashboard", "filters.apply")}
        </Button>
        <Button type="button" variant="outline" onClick={onClear}>
          {t("dashboard", "filters.clear")}
        </Button>
      </div>
    </form>
  );
}
