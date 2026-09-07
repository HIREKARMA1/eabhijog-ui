"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Section } from "@/components/ui/Section";
import { Spinner } from "@/components/ui/Spinner";
import { GrievanceJourneyTimeline } from "@/components/grievance/GrievanceJourneyTimeline";
import { fetchOsdGrievanceDetail, fetchOsdGrievances } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { cell, formatStatusLabel } from "@/lib/grievance/display";
import { useI18n } from "@/lib/i18n/context";
import type { JourneyEvent, PsGrievanceRow } from "@/types/api";

export function OsdGrievanceJourneyLookup({
  osdSlug,
  osdCategories,
}: {
  osdSlug: string;
  osdCategories: string[];
}) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [osdCategory, setOsdCategory] = useState("");
  const [items, setItems] = useState<PsGrievanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRef, setSelectedRef] = useState("");
  const [journey, setJourney] = useState<JourneyEvent[] | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyError, setJourneyError] = useState("");

  async function loadList(nextSearch = search, nextCategory = osdCategory) {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = { limit: "10" };
      const q = nextSearch.trim();
      if (q) params.search = q;
      if (nextCategory) params.osd_category = nextCategory;
      const result = await fetchOsdGrievances(osdSlug, params);
      setItems(result.data.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadList("", "");
    // Initial desk list only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [osdSlug]);

  useEffect(() => {
    if (!selectedRef) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setSelectedRef("");
      setJourney(null);
      setJourneyError("");
      setJourneyLoading(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedRef]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    closeJourney();
    void loadList(search, osdCategory);
  }

  async function onView(referenceNumber: string) {
    setSelectedRef(referenceNumber);
    setJourney(null);
    setJourneyError("");
    setJourneyLoading(true);
    setError("");
    try {
      const result = await fetchOsdGrievanceDetail(osdSlug, referenceNumber);
      setJourney(result.data.journey ?? []);
    } catch (err) {
      setJourneyError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
      setJourney(null);
    } finally {
      setJourneyLoading(false);
    }
  }

  function closeJourney() {
    setSelectedRef("");
    setJourney(null);
    setJourneyError("");
    setJourneyLoading(false);
  }

  const detailHref = selectedRef
    ? `/osd/${osdSlug}/grievance/${encodeURIComponent(selectedRef)}`
    : "";

  return (
    <Section
      title={t("dashboard", "grievance.lookupTitle")}
      className="rounded-2xl bg-white/55 p-4 shadow-sm ring-1 ring-white/70 lg:col-span-3"
    >
      <form onSubmit={onSearch} className="grid gap-3 sm:grid-cols-[1fr_14rem_auto]">
        <Input
          name="grievance-id-search"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder={t("dashboard", "grievance.searchById")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="block space-y-1.5">
          <select
            name="lookup-osd-category"
            value={osdCategory}
            onChange={(e) => {
              const next = e.target.value;
              setOsdCategory(next);
              closeJourney();
              void loadList(search, next);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-slate-300 focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-navy-700/15"
          >
            <option value="">{t("ps", "filters.all")}</option>
            {osdCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" loading={loading} disabled={loading}>
          {t("dashboard", "filters.apply")}
        </Button>
      </form>
      {error ? <p className="mt-2 text-sm text-amber-700">{error}</p> : null}
      <div className="relative mt-4">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-white/70 pt-16">
            <Spinner size="sm" />
          </div>
        ) : null}
        <DataTable
          rows={items}
          rowKey={(g) => g.reference_number}
          emptyMessage={t("dashboard", "table.empty")}
          columns={[
            {
              key: "id",
              header: t("ps", "grievances.table.grievanceId"),
              cell: (g) => (
                <span className="font-mono text-xs font-semibold text-slate-800">
                  {g.reference_number}
                </span>
              ),
            },
            {
              key: "citizen",
              header: t("ps", "grievances.table.citizenName"),
              cell: (g) => <span className="font-medium text-slate-800">{cell(g.citizen_name)}</span>,
            },
            {
              key: "status",
              header: t("ps", "grievances.table.currentStatus"),
              cell: (g) => <Badge>{formatStatusLabel(g.status)}</Badge>,
            },
            {
              key: "actions",
              header: t("ps", "grievances.table.actions"),
              cell: (g) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={journeyLoading && selectedRef === g.reference_number}
                  disabled={loading || (journeyLoading && selectedRef === g.reference_number)}
                  onClick={() => void onView(g.reference_number)}
                >
                  {t("ps", "grievances.table.view")}
                </Button>
              ),
            },
          ]}
        />
      </div>

      {selectedRef ? (
        <div className="fixed inset-0 z-80 flex items-end justify-center p-3 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label={t("common", "nav.close")}
            className="absolute inset-0 bg-slate-900/50"
            onClick={closeJourney}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="osd-lookup-journey-title"
            className="relative z-10 flex max-h-[min(90vh,44rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 bg-navy-700 px-4 py-3 text-white">
              <div className="min-w-0">
                <p id="osd-lookup-journey-title" className="text-sm font-semibold">
                  {t("dashboard", "journey.title")}
                </p>
                <p className="mt-0.5 font-mono text-xs text-white/80">{selectedRef}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={detailHref}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                >
                  {t("dashboard", "grievance.openCase")}
                </Link>
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                  onClick={closeJourney}
                >
                  {t("common", "nav.close")}
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {journeyLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Spinner size="md" />
                  <p className="text-sm text-text-muted">{t("dashboard", "journey.loading")}</p>
                </div>
              ) : journeyError ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {journeyError}
                </p>
              ) : (
                <GrievanceJourneyTimeline events={journey ?? []} />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
