"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/Button";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { SectionLoader } from "@/components/ui/Spinner";
import { Section } from "@/components/ui/Section";
import { ToastViewport, useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";
import { ApiError } from "@/lib/api/client";
import {
  closeHearingRegistration,
  completeHearing,
  createHearing,
  fetchHearing,
  fetchHearingRegistrations,
  fetchHearings,
  finalizeHearingShortlist,
  notifyHearingApproved,
  recordHearingRemarks,
  screenHearingRegistration,
  startHearing,
  updateHearing,
} from "@/lib/api/hearing";
import type {
  HearingDetail,
  HearingRegistrationRow,
  HearingScreeningStats,
} from "@/types/api";

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function StatsBar({ stats }: { stats: HearingScreeningStats }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
      {[
        ["Total", stats.total],
        ["Pending", stats.pending],
        ["Approved", stats.approved],
        ["Rejected", stats.rejected],
        ["Heard", stats.heard],
      ].map(([label, value]) => (
        <div
          key={String(label)}
          className="rounded-lg border border-border bg-white px-2.5 py-2 sm:rounded-xl sm:px-4 sm:py-3"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
            {label}
          </p>
          <p className="mt-0.5 text-lg font-semibold text-slate-900 sm:mt-1 sm:text-2xl">{value}</p>
        </div>
      ))}
    </div>
  );
}

type Props = {
  canManage: boolean;
};

export function HearingDesk({ canManage }: Props) {
  const [hearings, setHearings] = useState<HearingDetail[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hearing, setHearing] = useState<HearingDetail | null>(null);
  const [regs, setRegs] = useState<HearingRegistrationRow[]>([]);
  const [stats, setStats] = useState<HearingScreeningStats | null>(null);
  const [filter, setFilter] = useState("");
  const { toasts, success: toastSuccess, error: toastError, dismiss: dismissToast } = useToast();
  const [busy, setBusy] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [remarksDraft, setRemarksDraft] = useState("");
  const [mediaPreview, setMediaPreview] = useState<{
    url: string;
    label: string;
    kind: "image" | "video";
  } | null>(null);

  const loadList = useCallback(async () => {
    const res = await fetchHearings();
    setHearings(res.data.items);
    if (!selectedId && res.data.items[0]) {
      setSelectedId(res.data.items[0].id);
    }
  }, [selectedId]);

  const loadSelected = useCallback(async (id: number) => {
    const [detail, list] = await Promise.all([
      fetchHearing(id),
      fetchHearingRegistrations(id, filter ? { screening_status: filter } : {}),
    ]);
    setHearing(detail.data);
    setRegs(list.data.items);
    setStats(list.data.stats);
  }, [filter]);

  useEffect(() => {
    setListLoading(true);
    loadList()
      .catch((err) =>
        toastError(err instanceof ApiError ? err.message : "Failed to load hearings"),
      )
      .finally(() => setListLoading(false));
  }, [loadList, toastError]);

  useEffect(() => {
    if (!selectedId) {
      setHearing(null);
      setRegs([]);
      setStats(null);
      setDetailLoading(false);
      return;
    }
    setDetailLoading(true);
    loadSelected(selectedId)
      .catch((err) =>
        toastError(err instanceof ApiError ? err.message : "Failed to load screening data"),
      )
      .finally(() => setDetailLoading(false));
  }, [selectedId, loadSelected, toastError]);

  async function runAction(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      const res = await fn();
      const envelope = res as { data?: { message?: string }; message?: string };
      toastSuccess(envelope.data?.message ?? envelope.message ?? "Done.");
      if (selectedId) await loadSelected(selectedId);
      await loadList();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const hearingDate = String(form.get("hearing_date") || "");
    const hearingEnd = String(form.get("hearing_end_at") || "");
    const opensAt = String(form.get("registration_opens_at") || "");
    const closesAt = String(form.get("registration_closes_at") || "");

    if (!hearingDate || !opensAt || !closesAt) {
      toastError("Please select hearing start, registration open, and registration close times.");
      return;
    }

    const payload = {
      title: String(form.get("title") || ""),
      description: String(form.get("description") || ""),
      hearing_date: new Date(hearingDate).toISOString(),
      hearing_end_at: hearingEnd ? new Date(hearingEnd).toISOString() : null,
      registration_opens_at: new Date(opensAt).toISOString(),
      registration_closes_at: new Date(closesAt).toISOString(),
      google_meet_link: String(form.get("google_meet_link") || ""),
      publish: true,
    };
    await runAction(async () => {
      const res = await createHearing(payload);
      setSelectedId(res.data.id);
      setShowCreate(false);
      return { data: { message: "Hearing announced successfully." } };
    });
  }

  const selectedReg = regs.find((r) => r.id === detailId) ?? null;
  const hearingStatus = hearing?.status ?? "";
  const shortlistFinalized = Boolean(
    hearing?.shortlisted_at ||
      ["shortlisted", "notified", "in_progress", "completed"].includes(hearingStatus),
  );
  const notificationsSent = Boolean(
    hearing?.notified_at ||
      ["notified", "in_progress", "completed"].includes(hearingStatus),
  );
  const hearingStarted = hearingStatus === "in_progress";
  const hearingCompleted = hearingStatus === "completed";
  const canStartHearing = ["shortlisted", "notified"].includes(hearingStatus);
  const startHearingTooltip = hearingCompleted
    ? "Hearing already completed"
    : hearingStarted
      ? "Hearing already in progress"
      : !shortlistFinalized
        ? "Finalize shortlist first"
        : "Hearing cannot be started in the current state";

  return (
    <div className="space-y-3 sm:space-y-4">
      <Section
        title="Online Grievance Hearing"
        className="rounded-xl border border-border bg-white p-3 sm:rounded-2xl sm:p-4"
        action={
          canManage ? (
            <Button size="sm" className="w-full sm:w-auto" onClick={() => setShowCreate((v) => !v)}>
              {showCreate ? "Cancel" : "Announce hearing"}
            </Button>
          ) : null
        }
      >
        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
          Screen citizen registrations, assign serial numbers, notify via WhatsApp, and record
          Minister remarks on hearing day. Meet admission is managed in Google Meet by serial
          number.
        </p>
      </Section>

      {showCreate && canManage ? (
        <form
          onSubmit={onCreate}
          className="grid gap-3 rounded-xl border border-border bg-white p-3 sm:rounded-2xl sm:p-4 md:grid-cols-2"
        >
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium">Title</span>
            <input name="title" required className="w-full rounded-xl border px-3 py-2" />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium">Description</span>
            <textarea name="description" rows={2} className="w-full rounded-xl border px-3 py-2" />
          </label>
          <div className="text-sm">
            <span className="mb-1 block font-medium">Hearing start</span>
            <DateTimePicker name="hearing_date" required placeholder="Select hearing start" />
          </div>
          <div className="text-sm">
            <span className="mb-1 block font-medium">Hearing end</span>
            <DateTimePicker name="hearing_end_at" placeholder="Select hearing end (optional)" />
          </div>
          <div className="text-sm">
            <span className="mb-1 block font-medium">Registration opens</span>
            <DateTimePicker
              name="registration_opens_at"
              required
              placeholder="Select registration open time"
            />
          </div>
          <div className="text-sm">
            <span className="mb-1 block font-medium">Registration closes</span>
            <DateTimePicker
              name="registration_closes_at"
              required
              placeholder="Select registration close time"
            />
          </div>
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium">Google Meet link</span>
            <input name="google_meet_link" className="w-full rounded-xl border px-3 py-2" />
          </label>
          <div className="flex flex-col gap-2 md:col-span-2 sm:flex-row sm:items-center">
            <Button type="submit" loading={busy} className="w-full sm:w-auto">
              Publish hearing
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={busy}
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-4">
        <aside className="rounded-xl border border-border bg-white p-2.5 sm:rounded-2xl sm:p-3">
          <p className="px-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:px-2 sm:text-xs">
            Hearings
          </p>
          {listLoading ? (
            <SectionLoader label="Loading hearings…" className="py-6" />
          ) : hearings.length === 0 ? (
            <p className="px-1.5 py-2 text-sm text-slate-500 sm:px-2">No hearings yet.</p>
          ) : (
            <div className="-mx-0.5 flex gap-2 overflow-x-auto pb-1 pt-1.5 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
              {hearings.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setSelectedId(h.id)}
                  className={`min-w-[11.5rem] shrink-0 rounded-lg px-3 py-2 text-left text-sm transition-colors lg:min-w-0 lg:w-full lg:rounded-xl ${
                    selectedId === h.id
                      ? "bg-navy-700 text-white"
                      : "bg-surface-muted text-slate-800 hover:bg-slate-100 lg:bg-white"
                  }`}
                >
                  <span className="line-clamp-2 block font-medium leading-snug">{h.title}</span>
                  <span className="mt-0.5 block text-[11px] capitalize opacity-80">
                    {h.status.replaceAll("_", " ")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="relative min-w-0 space-y-3 sm:space-y-4">
          {detailLoading ? (
            <SectionLoader
              label="Loading hearing details…"
              className="min-h-40 rounded-xl border border-border bg-white sm:min-h-80 sm:rounded-2xl"
            />
          ) : hearing ? (
            <>
              <Section
                title={hearing.title}
                className="rounded-xl border border-border bg-white p-3 sm:rounded-2xl sm:p-4"
              >
                <div className="flex flex-col gap-1.5 text-xs text-slate-700 sm:flex-row sm:flex-wrap sm:gap-3 sm:text-sm">
                  <span>Hearing: {formatWhen(hearing.hearing_date)}</span>
                  <span className="capitalize">Status: {hearing.status.replaceAll("_", " ")}</span>
                  {hearing.google_meet_link ? (
                    <a
                      href={hearing.google_meet_link}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-link hover:underline"
                    >
                      Open Meet link
                    </a>
                  ) : null}
                  <Link href="/hearing" className="font-medium text-link hover:underline">
                    Public registration page
                  </Link>
                </div>
                {canManage && !hearing.google_meet_link ? (
                  <form
                    className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const link = new FormData(e.currentTarget).get("google_meet_link");
                      runAction(async () => {
                        await updateHearing(hearing.id, { google_meet_link: String(link || "") });
                        return { data: { message: "Meet link saved." } };
                      });
                    }}
                  >
                    <input
                      name="google_meet_link"
                      placeholder="Add Google Meet link"
                      className="w-full min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm sm:min-w-60"
                    />
                    <Button type="submit" size="sm" loading={busy} className="w-full sm:w-auto">
                      Save link
                    </Button>
                  </form>
                ) : null}
                <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:flex-wrap">
                  {canManage ? (
                    <ActionButton
                      className="col-span-2 sm:col-auto"
                      size="sm"
                      variant="outline"
                      loading={busy}
                      disabled={!hearing.registration_open}
                      tooltip={!hearing.registration_open ? "Registration has closed" : undefined}
                      onClick={() => runAction(() => closeHearingRegistration(hearing.id))}
                    >
                      Close registration
                    </ActionButton>
                  ) : null}
                  <ActionButton
                    size="sm"
                    variant="secondary"
                    loading={busy}
                    disabled={shortlistFinalized}
                    tooltip={shortlistFinalized ? "Shortlist already finalized" : undefined}
                    onClick={() => runAction(() => finalizeHearingShortlist(hearing.id))}
                  >
                    Finalize shortlist
                  </ActionButton>
                  <ActionButton
                    size="sm"
                    loading={busy}
                    className="col-span-2 sm:col-auto"
                    disabled={notificationsSent}
                    tooltip={notificationsSent ? "Notifications already sent" : undefined}
                    onClick={() => runAction(() => notifyHearingApproved(hearing.id))}
                  >
                    Notify approved (WhatsApp)
                  </ActionButton>
                  <ActionButton
                    size="sm"
                    variant="outline"
                    loading={busy}
                    disabled={!canStartHearing}
                    tooltip={!canStartHearing ? startHearingTooltip : undefined}
                    onClick={() => runAction(() => startHearing(hearing.id))}
                  >
                    Start hearing
                  </ActionButton>
                  <ActionButton
                    size="sm"
                    variant="ghost"
                    loading={busy}
                    disabled={hearingCompleted}
                    tooltip={hearingCompleted ? "Hearing already completed" : undefined}
                    onClick={() => runAction(() => completeHearing(hearing.id))}
                  >
                    Complete
                  </ActionButton>
                </div>
              </Section>

              {stats ? <StatsBar stats={stats} /> : null}

              <Section
                title="Screening queue"
                className="rounded-xl border border-border bg-white p-3 sm:rounded-2xl sm:p-4"
                action={
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full rounded-lg border px-2 py-1.5 text-sm sm:w-auto"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                }
              >
                {/* Mobile card list */}
                <div className="space-y-2 md:hidden">
                  {regs.map((row) => (
                    <article
                      key={row.id}
                      className="rounded-lg border border-border bg-surface-muted p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {row.serial_number != null ? `Serial ${row.serial_number}` : "No serial"}
                            {" · "}
                            <span className="capitalize">{row.screening_status}</span>
                          </p>
                          <h3 className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                            {row.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {row.citizen_name} · {row.citizen_phone}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                            {row.reference_number}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => setDetailId(row.id)}>
                          View
                        </Button>
                        {row.screening_status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              loading={busy}
                              onClick={() =>
                                runAction(async () => {
                                  await screenHearingRegistration(
                                    hearing.id,
                                    row.id,
                                    "approve",
                                  );
                                  return { data: { message: "Registration approved." } };
                                })
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setRejectId(row.id);
                                setRejectRemarks("");
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </article>
                  ))}
                  {regs.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">
                      No registrations in this filter.
                    </p>
                  ) : null}
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-2 py-2">Serial</th>
                        <th className="px-2 py-2">Reference</th>
                        <th className="px-2 py-2">Citizen</th>
                        <th className="px-2 py-2">Title</th>
                        <th className="px-2 py-2">Status</th>
                        <th className="px-2 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regs.map((row) => (
                        <tr key={row.id} className="border-t border-slate-100">
                          <td className="px-2 py-2 font-semibold">{row.serial_number ?? "-"}</td>
                          <td className="px-2 py-2">{row.reference_number}</td>
                          <td className="px-2 py-2">
                            <div>{row.citizen_name}</div>
                            <div className="text-xs text-slate-500">{row.citizen_phone}</div>
                          </td>
                          <td className="max-w-55 truncate px-2 py-2">{row.title}</td>
                          <td className="px-2 py-2 capitalize">{row.screening_status}</td>
                          <td className="px-2 py-2">
                            <div className="flex flex-wrap gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setDetailId(row.id)}>
                                View
                              </Button>
                              {row.screening_status === "pending" ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    loading={busy}
                                    onClick={() =>
                                      runAction(async () => {
                                        await screenHearingRegistration(
                                          hearing.id,
                                          row.id,
                                          "approve",
                                        );
                                        return { data: { message: "Registration approved." } };
                                      })
                                    }
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => {
                                      setRejectId(row.id);
                                      setRejectRemarks("");
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {regs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-2 py-6 text-center text-slate-500">
                            No registrations in this filter.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </Section>
            </>
          ) : (
            <p className="rounded-xl border border-border bg-white p-4 text-sm text-slate-500 sm:rounded-2xl sm:p-6">
              Select or announce a hearing to begin screening.
            </p>
          )}
        </div>
      </div>

      {rejectId && hearing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-5">
            <h3 className="text-lg font-semibold">Reject / discard</h3>
            <p className="mt-1 text-sm text-slate-600">Optional remarks for the screening record.</p>
            <textarea
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-xl border px-3 py-2 text-sm"
            />
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setRejectId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={busy}
                className="w-full sm:w-auto"
                onClick={() =>
                  runAction(async () => {
                    const res = await screenHearingRegistration(
                      hearing.id,
                      rejectId,
                      "reject",
                      rejectRemarks,
                    );
                    setRejectId(null);
                    return { data: { message: `Discarded ${res.data.reference_number}` } };
                  })
                }
              >
                Confirm reject
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedReg && hearing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-white px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-saffron">
                  Registration detail
                  {selectedReg.serial_number != null
                    ? ` · Serial ${selectedReg.serial_number}`
                    : ""}
                </p>
                <h3 className="mt-0.5 break-words text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                  {selectedReg.title}
                </h3>
                <p className="mt-1 font-mono text-xs text-slate-500 sm:text-sm">
                  {selectedReg.reference_number}
                  <span className="mx-1.5 text-slate-300">·</span>
                  <span className="capitalize">{selectedReg.screening_status}</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  setDetailId(null);
                  setMediaPreview(null);
                }}
              >
                Close
              </Button>
            </div>

            <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
              <DetailSection title="Citizen details">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailField label="Name" value={selectedReg.citizen_name} />
                  <DetailField label="WhatsApp number" value={selectedReg.citizen_phone} />
                  <DetailField label="Pincode" value={selectedReg.citizen_pincode || "-"} />
                  <DetailField label="Email" value={selectedReg.citizen_email || "-"} />
                </div>
              </DetailSection>

              <DetailSection title="Category & department">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailField
                    label="Service category"
                    value={selectedReg.service_category || selectedReg.osd_category || "-"}
                  />
                  <DetailField
                    label="District / constituency"
                    value={
                      [
                        selectedReg.geographic_district,
                        selectedReg.constituency,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "-"
                    }
                  />
                  <DetailField label="Department" value={selectedReg.department || "-"} />
                  <DetailField label="Sub-department" value={selectedReg.sub_department || "-"} />
                  {selectedReg.organization ? (
                    <DetailField
                      label="Organization"
                      value={selectedReg.organization.replace(/\s*\|\s*/g, ", ")}
                      className="sm:col-span-2"
                    />
                  ) : null}
                </div>
              </DetailSection>

              <DetailSection title="Grievance">
                <div className="space-y-3">
                  <DetailField label="Title" value={selectedReg.title} />
                  <DetailField label="Area" value={selectedReg.area || "-"} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Description
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-border bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800">
                      {selectedReg.grievance_text || "-"}
                    </p>
                  </div>
                </div>
              </DetailSection>

              <DetailSection
                title={`Attachments${selectedReg.attachments?.length ? ` (${selectedReg.attachments.length})` : ""}`}
              >
                {selectedReg.attachments?.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedReg.attachments.map((att, index) => {
                      const kind = attachmentKind(att.mime_type);
                      const label =
                        kind === "image"
                          ? `Photo ${index + 1}`
                          : kind === "video"
                            ? `Video ${index + 1}`
                            : kind === "pdf"
                              ? `Document ${index + 1}`
                              : `File ${index + 1}`;
                      const sizeLabel = att.file_size
                        ? `${Math.round(att.file_size / 1024)} KB`
                        : "";

                      return (
                        <div
                          key={`${att.id}-${att.file_path}`}
                          className="overflow-hidden rounded-lg border border-border bg-white"
                        >
                          {kind === "image" ? (
                            <button
                              type="button"
                              onClick={() =>
                                setMediaPreview({
                                  url: att.file_path,
                                  label,
                                  kind: "image",
                                })
                              }
                              className="block w-full text-left"
                            >
                              <div className="aspect-[4/3] bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={att.file_path}
                                  alt={label}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                            </button>
                          ) : kind === "video" ? (
                            <button
                              type="button"
                              onClick={() =>
                                setMediaPreview({
                                  url: att.file_path,
                                  label,
                                  kind: "video",
                                })
                              }
                              className="relative block w-full text-left"
                            >
                              <div className="aspect-[4/3] bg-slate-900">
                                <video
                                  src={att.file_path}
                                  className="h-full w-full object-contain"
                                  muted
                                  playsInline
                                  preload="metadata"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-sm font-semibold text-white">
                                  Play video
                                </span>
                              </div>
                            </button>
                          ) : (
                            <a
                              href={att.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex aspect-[4/3] flex-col items-center justify-center bg-surface-muted px-4 text-center hover:bg-slate-100"
                            >
                              <span className="text-2xl font-bold text-navy-700">
                                {kind === "pdf" ? "PDF" : "FILE"}
                              </span>
                              <span className="mt-2 text-xs text-slate-600">Open file</span>
                            </a>
                          )}
                          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-slate-800">{label}</p>
                              {sizeLabel ? (
                                <p className="text-[11px] text-slate-500">{sizeLabel}</p>
                              ) : null}
                            </div>
                            <a
                              href={att.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-[11px] font-semibold text-navy-700 hover:underline"
                            >
                              Open
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No attachments submitted.</p>
                )}
              </DetailSection>

              {(selectedReg.rejection_remarks ||
                selectedReg.minister_remarks ||
                selectedReg.screened_at ||
                selectedReg.notified_at ||
                selectedReg.heard_at) && (
                <DetailSection title="Screening & hearing notes">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedReg.screened_at ? (
                      <DetailField label="Screened at" value={formatWhen(selectedReg.screened_at)} />
                    ) : null}
                    {selectedReg.notified_at ? (
                      <DetailField label="Notified at" value={formatWhen(selectedReg.notified_at)} />
                    ) : null}
                    {selectedReg.heard_at ? (
                      <DetailField label="Heard at" value={formatWhen(selectedReg.heard_at)} />
                    ) : null}
                    {selectedReg.rejection_remarks ? (
                      <DetailField
                        label="Rejection remarks"
                        value={selectedReg.rejection_remarks}
                        className="sm:col-span-2"
                      />
                    ) : null}
                    {selectedReg.minister_remarks ? (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Minister remarks
                        </p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">
                          {selectedReg.minister_remarks}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </DetailSection>
              )}

              {selectedReg.screening_status === "approved" ? (
                <div className="rounded-lg border border-border bg-surface-muted p-3 sm:p-4">
                  <p className="text-sm font-medium text-slate-900">
                    Record Minister remarks (hearing day)
                  </p>
                  <textarea
                    value={remarksDraft}
                    onChange={(e) => setRemarksDraft(e.target.value)}
                    rows={3}
                    className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    placeholder="Directions / remarks from the Hon'ble Minister"
                  />
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                      size="sm"
                      loading={busy}
                      className="w-full sm:w-auto"
                      onClick={() =>
                        runAction(async () => {
                          const res = await recordHearingRemarks(
                            hearing.id,
                            selectedReg.id,
                            remarksDraft,
                            true,
                          );
                          setRemarksDraft("");
                          setDetailId(res.data.id);
                          return { data: { message: "Remarks saved. Citizen marked as heard." } };
                        })
                      }
                    >
                      Save remarks & mark heard
                    </Button>
                    <Link
                      href={`/ps/grievance/${encodeURIComponent(selectedReg.reference_number)}`}
                      className="inline-flex w-full items-center justify-center rounded-xl border bg-white px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-slate-50 sm:w-auto"
                    >
                      Open in grievance workflow
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {mediaPreview ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal
          aria-label={`Preview ${mediaPreview.label}`}
          onClick={() => setMediaPreview(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
              <p className="truncate text-sm font-semibold text-slate-900">{mediaPreview.label}</p>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={mediaPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-navy-700 hover:underline"
                >
                  Open original
                </a>
                <Button size="sm" variant="ghost" onClick={() => setMediaPreview(null)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="flex max-h-[calc(90vh-3.25rem)] items-center justify-center bg-slate-950 p-2">
              {mediaPreview.kind === "video" ? (
                <video
                  src={mediaPreview.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[calc(90vh-4rem)] w-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaPreview.url}
                  alt={mediaPreview.label}
                  className="max-h-[calc(90vh-4rem)] w-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function ActionButton({
  tooltip,
  className,
  disabled,
  children,
  ...props
}: ComponentProps<typeof Button> & {
  tooltip?: string;
}) {
  return (
    <span className={cn("group relative inline-flex w-full sm:w-auto", className)}>
      <Button
        {...props}
        disabled={disabled}
        aria-disabled={disabled}
        className="w-full sm:w-auto"
      >
        {children}
      </Button>
      {disabled && tooltip ? (
        <>
          <span className="absolute inset-0 z-10 cursor-not-allowed" aria-hidden />
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-max max-w-[14rem] -translate-x-1/2 rounded-md bg-slate-900 px-2.5 py-1.5 text-center text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          >
            {tooltip}
          </span>
        </>
      ) : null}
    </span>
  );
}

function attachmentKind(mime: string): "image" | "video" | "pdf" | "other" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf" || mime.includes("pdf")) return "pdf";
  return "other";
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface-muted p-3 sm:p-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-navy-700">{title}</h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 break-words text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
