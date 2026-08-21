"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

import { Icon } from "@/components/icons/Icon";
import {
  HearingLocaleTabBar,
  HearingLocalizedContentFields,
  buildContentI18nPayload,
  bundleFromHearing,
  emptyLocaleBundle,
  type HearingContentLocale,
  type HearingLocaleBundle,
} from "@/components/hearing/HearingLocalizedContentFields";
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
  deleteHearing,
  downloadHearingRegistrationPdf,
  exportHearingRegistrationsCsv,
  HEARING_DESK_CATEGORIES,
  fetchHearing,
  fetchHearingRegistrations,
  fetchHearings,
  finalizeHearingShortlist,
  notifyHearingApproved,
  recordHearingRemarks,
  screenHearingRegistration,
  sendHearingRegistrationWhatsApp,
  startHearing,
  updateHearing,
  uploadHearingBanner,
} from "@/lib/api/hearing";
import { useI18n } from "@/lib/i18n/context";
import {
  DEFAULT_HEARING_IMPORTANT_NOTES,
  DEFAULT_HEARING_TITLE_EN,
  DEFAULT_HEARING_TITLE_HI,
  DEFAULT_HEARING_TITLE_OR,
  DEFAULT_HEARING_WHAT_TO_EXPECT,
} from "@/lib/hearing/eventDefaults";
import type {
  HearingDetail,
  HearingRegistrationRow,
  HearingScreeningStats,
} from "@/types/api";
import { HearingRichTextEditor } from "./HearingRichTextEditor";
import { toEditorHtml } from "@/lib/hearing/richText";

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

function publicHearingPath(hearingId: number) {
  return `/hearing/${hearingId}`;
}

function publicHearingAbsoluteUrl(hearingId: number) {
  if (typeof window === "undefined") return publicHearingPath(hearingId);
  return `${window.location.origin}${publicHearingPath(hearingId)}`;
}

function PublicHearingShareLink({
  hearingId,
  onCopied,
  onCopyFailed,
}: {
  hearingId: number;
  onCopied: (message: string) => void;
  onCopyFailed: (message: string) => void;
}) {
  const path = publicHearingPath(hearingId);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = publicHearingAbsoluteUrl(hearingId);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onCopied("Public hearing link copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopyFailed("Could not copy link. Select and copy it manually.");
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-muted/60 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Public hearing link
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700 sm:text-sm" title={path}>
          {path}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-slate-700 transition-colors hover:bg-slate-50"
            title={copied ? "Copied" : "Copy link"}
            aria-label={copied ? "Copied" : "Copy public hearing link"}
          >
            <Icon name="copy" size={15} />
          </button>
          <a
            href={path}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-slate-700 transition-colors hover:bg-slate-50"
            title="Open public page"
            aria-label="Open public hearing page"
          >
            <Icon name="external-link" size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}

function parseBannerUrlsFromForm(form: FormData): string[] {
  const raw = String(form.get("banner_image_urls") || "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
    }
  } catch {
    /* ignore */
  }
  return raw ? [raw] : [];
}

function BannerImageField({
  name = "banner_image_urls",
  initialUrls = [],
  maxCount = 5,
  disabled,
  onUpload,
  onError,
}: {
  name?: string;
  /** Existing banner URLs or storage keys (order preserved). */
  initialUrls?: string[];
  maxCount?: number;
  disabled?: boolean;
  onUpload: (file: File) => Promise<{ storageKey: string; previewUrl: string }>;
  onError: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<{ key: string; preview: string }[]>(() =>
    initialUrls.filter(Boolean).map((url) => ({ key: url, preview: url })),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(initialUrls.filter(Boolean).map((url) => ({ key: url, preview: url })));
  }, [initialUrls.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps -- sync when URL list identity changes

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const room = maxCount - items.length;
    if (room <= 0) {
      onError(`You can upload at most ${maxCount} banner images.`);
      return;
    }
    const files = Array.from(list).slice(0, room);
    setUploading(true);
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          onError("Choose JPG, PNG, or WebP images.");
          continue;
        }
        const objectUrl = URL.createObjectURL(file);
        try {
          const result = await onUpload(file);
          const key = result.storageKey || result.previewUrl;
          const preview = result.previewUrl || objectUrl;
          setItems((prev) => {
            if (prev.length >= maxCount || prev.some((i) => i.key === key)) return prev;
            return [...prev, { key, preview }];
          });
        } catch (err) {
          onError(err instanceof ApiError ? err.message : "Banner upload failed");
        }
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const keysJson = JSON.stringify(items.map((i) => i.key));

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={keysJson} />
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={`${item.key}-${index}`}
              className="relative overflow-hidden rounded-xl border border-border bg-slate-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.preview} alt={`Banner ${index + 1}`} className="h-28 w-full object-cover" />
              <button
                type="button"
                disabled={uploading || disabled}
                onClick={() => removeAt(index)}
                className="absolute right-1.5 top-1.5 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-red-700 shadow hover:bg-white"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-3 text-center text-xs text-slate-500">
          No banners uploaded - public page uses the default banner.
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          loading={uploading}
          disabled={uploading || disabled || items.length >= maxCount}
          onClick={() => inputRef.current?.click()}
        >
          {items.length ? "Add banner" : "Upload banner"}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <p className="text-[11px] text-slate-500">
        Up to {maxCount} images (JPG, PNG, or WebP, max 5 MB each). Shown as a carousel on the public page.
      </p>
    </div>
  );
}

function EventPageDetailsForm({
  hearing,
  busy,
  onSave,
  onCancel,
  onBannerUpload,
  onError,
}: {
  hearing: HearingDetail;
  busy: boolean;
  onSave: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
  onBannerUpload: (file: File) => Promise<{ storageKey: string; previewUrl: string }>;
  onError: (message: string) => void;
}) {
  const [localeTab, setLocaleTab] = useState<HearingContentLocale>("en");
  const [localeBundle, setLocaleBundle] = useState<HearingLocaleBundle>(() =>
    bundleFromHearing(hearing),
  );

  return (
    <form
      className="mt-3 grid gap-2 rounded-xl border border-border bg-surface-muted/40 p-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const localized = buildContentI18nPayload(localeBundle);
        if (!localized.title || localized.title.length < 3) {
          onError("English title is required (at least 3 characters).");
          setLocaleTab("en");
          return;
        }
        onSave({
          ...localized,
          banner_image_urls: parseBannerUrlsFromForm(form),
          venue: String(form.get("venue") || ""),
          hosted_by: String(form.get("hosted_by") || ""),
        });
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2">
        Edit hearing details
      </p>
      <HearingLocaleTabBar value={localeTab} onChange={setLocaleTab} />
      <HearingLocalizedContentFields
        locale={localeTab}
        values={localeBundle[localeTab]}
        onChange={(next) => setLocaleBundle((prev) => ({ ...prev, [localeTab]: next }))}
        expectDefault={DEFAULT_HEARING_WHAT_TO_EXPECT}
        notesDefault={DEFAULT_HEARING_IMPORTANT_NOTES}
      />
      <label className="text-sm">
        <span className="mb-1 block font-medium">Mode</span>
        <input
          name="venue"
          defaultValue={hearing.venue || "Online (Google Meet)"}
          className="min-h-11 w-full rounded-xl border bg-white px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Hosted by</span>
        <input
          name="hosted_by"
          defaultValue={hearing.hosted_by || ""}
          placeholder="e.g. Office of the Hon'ble Cabinet Minister"
          className="min-h-11 w-full rounded-xl border bg-white px-3 py-2"
        />
      </label>
      <div className="text-sm sm:col-span-2">
        <span className="mb-1 block font-medium">Banner images</span>
        <BannerImageField
          key={`banner-${hearing.id}-${(hearing.banner_image_urls || []).join("|") || hearing.banner_image_url || "none"}`}
          initialUrls={
            hearing.banner_image_urls?.length
              ? hearing.banner_image_urls
              : hearing.banner_image_url
                ? [hearing.banner_image_url]
                : []
          }
          disabled={busy}
          onError={onError}
          onUpload={onBannerUpload}
        />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
        <Button type="submit" size="sm" loading={busy} className="min-h-11 w-full sm:w-auto">
          Save hearing
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          className="min-h-11 w-full sm:w-auto"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function detailsCollapsedStorageKey(hearingId: number) {
  return `hearing-desk-collapsed-${hearingId}`;
}

function readDetailsCollapsed(hearingId: number): boolean {
  if (typeof window === "undefined") return true;
  const raw = sessionStorage.getItem(detailsCollapsedStorageKey(hearingId));
  if (raw === null) return true;
  return raw === "1";
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
  const { locale, t } = useI18n();
  const [hearings, setHearings] = useState<HearingDetail[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hearing, setHearing] = useState<HearingDetail | null>(null);
  const [regs, setRegs] = useState<HearingRegistrationRow[]>([]);
  const [stats, setStats] = useState<HearingScreeningStats | null>(null);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [exportingCsv, setExportingCsv] = useState(false);
  const { toasts, success: toastSuccess, error: toastError, dismiss: dismissToast } = useToast();
  const [busy, setBusy] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createLocaleTab, setCreateLocaleTab] = useState<HearingContentLocale>("en");
  const [createLocaleBundle, setCreateLocaleBundle] = useState<HearingLocaleBundle>(() =>
    emptyLocaleBundle(),
  );
  const [detailsCollapsed, setDetailsCollapsed] = useState(true);
  const [editingDetails, setEditingDetails] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [whatsappRegId, setWhatsappRegId] = useState<number | null>(null);
  const [whatsappDraft, setWhatsappDraft] = useState("");
  const [whatsappSending, setWhatsappSending] = useState(false);
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
    const params: Record<string, string> = {};
    if (filter) params.screening_status = filter;
    if (categoryFilter) params.service_category = categoryFilter;
    const [detail, list] = await Promise.all([
      fetchHearing(id),
      fetchHearingRegistrations(id, params),
    ]);
    setHearing(detail.data);
    setRegs(list.data.items);
    setStats(list.data.stats);
  }, [filter, categoryFilter]);

  const downloadRegistrationPdf = useCallback(
    (registrationId: number) => {
      if (!hearing) return;
      void downloadHearingRegistrationPdf(hearing.id, registrationId, locale)
        .catch((err) =>
          toastError(
            err instanceof ApiError ? err.message : t("hearing", "desk.pdfFailed"),
          ),
        );
    },
    [hearing, locale, t, toastError],
  );

  useEffect(() => {
    setListLoading(true);
    loadList()
      .catch((err) =>
        toastError(err instanceof ApiError ? err.message : "Failed to load hearings"),
      )
      .finally(() => setListLoading(false));
  }, [loadList, toastError]);

  useEffect(() => {
    setConfirmDelete(false);
    setEditingDetails(false);
    if (!selectedId) {
      setHearing(null);
      setRegs([]);
      setStats(null);
      setDetailLoading(false);
      setDetailsCollapsed(true);
      return;
    }
    setDetailsCollapsed(readDetailsCollapsed(selectedId));
    setDetailLoading(true);
    loadSelected(selectedId)
      .catch((err) =>
        toastError(err instanceof ApiError ? err.message : "Failed to load screening data"),
      )
      .finally(() => setDetailLoading(false));
  }, [selectedId, loadSelected, toastError]);

  async function runAction(fn: () => Promise<unknown>, opts?: { skipReloadSelected?: boolean }) {
    setBusy(true);
    try {
      const res = await fn();
      const envelope = res as { data?: { message?: string }; message?: string };
      toastSuccess(envelope.data?.message ?? envelope.message ?? "Done.");
      if (!opts?.skipReloadSelected && selectedId) await loadSelected(selectedId);
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

    const localized = buildContentI18nPayload(createLocaleBundle);
    if (!localized.title || localized.title.length < 3) {
      toastError("English title is required (at least 3 characters).");
      setCreateLocaleTab("en");
      return;
    }

    const payload = {
      ...localized,
      hearing_date: new Date(hearingDate).toISOString(),
      hearing_end_at: hearingEnd ? new Date(hearingEnd).toISOString() : null,
      registration_opens_at: new Date(opensAt).toISOString(),
      registration_closes_at: new Date(closesAt).toISOString(),
      google_meet_link: String(form.get("google_meet_link") || ""),
      banner_image_urls: parseBannerUrlsFromForm(form),
      venue: String(form.get("venue") || "Online (Google Meet)"),
      hosted_by: String(form.get("hosted_by") || ""),
      publish: true,
    };
    await runAction(async () => {
      const res = await createHearing(payload);
      setSelectedId(res.data.id);
      setShowCreate(false);
      setCreateLocaleBundle(emptyLocaleBundle());
      setCreateLocaleTab("en");
      return { data: { message: "Hearing announced successfully." } };
    });
  }

  function toggleDetailsCollapsed() {
    if (!hearing) return;
    setDetailsCollapsed((prev) => {
      const next = !prev;
      sessionStorage.setItem(detailsCollapsedStorageKey(hearing.id), next ? "1" : "0");
      if (next) setEditingDetails(false);
      return next;
    });
  }

  const selectedReg = regs.find((r) => r.id === detailId) ?? null;
  const whatsappTarget = regs.find((r) => r.id === whatsappRegId) ?? null;
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
            <Button size="sm" className="w-full sm:w-auto" onClick={() => {
              setShowCreate((v) => {
                const next = !v;
                if (next) {
                  setCreateLocaleTab("en");
                  setCreateLocaleBundle({
                    ...emptyLocaleBundle(),
                    en: {
                      title: DEFAULT_HEARING_TITLE_EN,
                      description: "",
                      what_to_expect: DEFAULT_HEARING_WHAT_TO_EXPECT,
                      important_notes: DEFAULT_HEARING_IMPORTANT_NOTES,
                    },
                    or: {
                      title: DEFAULT_HEARING_TITLE_OR,
                      description: "",
                      what_to_expect: "",
                      important_notes: "",
                    },
                    hi: {
                      title: DEFAULT_HEARING_TITLE_HI,
                      description: "",
                      what_to_expect: "",
                      important_notes: "",
                    },
                  });
                }
                return next;
              });
            }}>
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
          <div className="md:col-span-2">
            <HearingLocaleTabBar value={createLocaleTab} onChange={setCreateLocaleTab} />
          </div>
          <HearingLocalizedContentFields
            className="md:col-span-2"
            locale={createLocaleTab}
            values={createLocaleBundle[createLocaleTab]}
            onChange={(next) =>
              setCreateLocaleBundle((prev) => ({ ...prev, [createLocaleTab]: next }))
            }
            expectDefault={DEFAULT_HEARING_WHAT_TO_EXPECT}
            notesDefault={DEFAULT_HEARING_IMPORTANT_NOTES}
          />
          <label className="text-sm">
            <span className="mb-1 block font-medium">Mode</span>
            <input
              name="venue"
              defaultValue="Online (Google Meet)"
              className="min-h-11 w-full rounded-xl border px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Hosted by</span>
            <input
              name="hosted_by"
              placeholder="e.g. Office of the Hon'ble Cabinet Minister"
              className="min-h-11 w-full rounded-xl border px-3 py-2"
            />
          </label>
          <div className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium">Banner images</span>
            <BannerImageField
              onError={toastError}
              onUpload={async (file) => {
                const res = await uploadHearingBanner(file);
                toastSuccess("Banner uploaded.");
                return {
                  storageKey: res.data.storage_key,
                  previewUrl: res.data.banner_image_url,
                };
              }}
            />
          </div>
          <HearingRichTextEditor
            className="md:col-span-2"
            name="what_to_expect"
            label="What to expect"
            defaultValue={toEditorHtml(DEFAULT_HEARING_WHAT_TO_EXPECT)}
            minHeightClassName="min-h-52"
            hint="Prefilled for most hearings. Use the toolbar to format text like an email editor."
          />
          {/* <HearingRichTextEditor
            className="md:col-span-2"
            name="important_notes"
            label="Important notes"
            defaultValue={toEditorHtml(DEFAULT_HEARING_IMPORTANT_NOTES)}
            minHeightClassName="min-h-48"
            hint="Prefilled standard notes. Change only when required for this hearing."
          /> */}
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
            <input name="google_meet_link" className="min-h-11 w-full rounded-xl border px-3 py-2" />
          </label>
          <div className="flex flex-col gap-2 md:col-span-2 sm:flex-row sm:items-center">
            <Button type="submit" loading={busy} className="min-h-11 w-full sm:w-auto">
              Publish hearing
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              disabled={busy}
              onClick={() => {
                setShowCreate(false);
                setCreateLocaleBundle(emptyLocaleBundle());
                setCreateLocaleTab("en");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[168px_minmax(0,1fr)] lg:gap-4">
        <aside className="rounded-xl border border-border bg-white p-2 sm:rounded-2xl sm:p-2.5">
          <p className="px-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:px-2">
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
                  className={`min-w-[10rem] shrink-0 rounded-lg px-2.5 py-2 text-left text-sm transition-colors lg:min-w-0 lg:w-full lg:rounded-xl ${
                    selectedId === h.id
                      ? "bg-navy-700 text-white"
                      : "bg-surface-muted text-slate-800 hover:bg-slate-100 lg:bg-white"
                  }`}
                >
                  <span className="line-clamp-2 block text-[13px] font-medium leading-snug">{h.title}</span>
                  <span className="mt-0.5 block text-[10px] capitalize opacity-80">
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
                action={
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    {canManage ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="min-h-11 w-full sm:w-auto"
                        onClick={() => {
                          setDetailsCollapsed(false);
                          sessionStorage.setItem(detailsCollapsedStorageKey(hearing.id), "0");
                          setEditingDetails(true);
                        }}
                      >
                        Edit hearing
                      </Button>
                    ) : null}
                    <button
                      type="button"
                      aria-expanded={!detailsCollapsed}
                      aria-label={detailsCollapsed ? "Expand hearing details" : "Collapse hearing details"}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-surface-muted sm:w-auto"
                      onClick={toggleDetailsCollapsed}
                    >
                      {detailsCollapsed ? "Show details" : "Hide details"}
                      <Icon
                        name="chevron-right"
                        size={16}
                        className={cn("transition-transform", detailsCollapsed ? "rotate-90" : "-rotate-90")}
                      />
                    </button>
                  </div>
                }
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
                </div>
                <PublicHearingShareLink
                  hearingId={hearing.id}
                  onCopied={toastSuccess}
                  onCopyFailed={toastError}
                />

                {!detailsCollapsed ? (
                  <>
                    {canManage && editingDetails ? (
                      <EventPageDetailsForm
                        key={`edit-${hearing.id}`}
                        hearing={hearing}
                        busy={busy}
                        onError={toastError}
                        onCancel={() => setEditingDetails(false)}
                        onBannerUpload={async (file) => {
                          const res = await uploadHearingBanner(file);
                          toastSuccess("Banner uploaded.");
                          return {
                            storageKey: res.data.storage_key,
                            previewUrl: res.data.banner_image_url,
                          };
                        }}
                        onSave={(payload) =>
                          runAction(async () => {
                            await updateHearing(hearing.id, payload);
                            setEditingDetails(false);
                            return { data: { message: "Hearing details saved." } };
                          })
                        }
                      />
                    ) : (
                      <div className="mt-3 rounded-xl border border-border bg-surface-muted/40 px-3 py-3 text-sm text-slate-700">
                        <p>
                          <span className="font-medium text-slate-500">Mode:</span>{" "}
                          {hearing.venue || "Online (Google Meet)"}
                        </p>
                        {hearing.hosted_by ? (
                          <p className="mt-1">
                            <span className="font-medium text-slate-500">Hosted by:</span>{" "}
                            {hearing.hosted_by}
                          </p>
                        ) : null}
                        {canManage ? (
                          <p className="mt-2 text-xs text-slate-500">
                            Use Edit hearing to change title, languages, and event page copy.
                          </p>
                        ) : null}
                      </div>
                    )}
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
                        <Button type="submit" size="sm" loading={busy} className="min-h-11 w-full sm:w-auto">
                          Save link
                        </Button>
                      </form>
                    ) : null}
                  </>
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
                  {canManage ? (
                    <ActionButton
                      size="sm"
                      variant="danger"
                      loading={busy}
                      className="col-span-2 sm:col-auto sm:ml-auto"
                      onClick={() => setConfirmDelete(true)}
                    >
                      Delete hearing
                    </ActionButton>
                  ) : null}
                </div>
              </Section>

              {stats ? <StatsBar stats={stats} /> : null}

              <Section
                title="Screening queue"
                className="rounded-xl border border-border bg-white p-3 sm:rounded-2xl sm:p-4"
                action={
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      loading={exportingCsv}
                      disabled={!hearing || exportingCsv}
                      className="w-full sm:w-auto"
                      onClick={() => {
                        if (!hearing) return;
                        setExportingCsv(true);
                        void exportHearingRegistrationsCsv(hearing.id, {
                          screeningStatus: filter || undefined,
                          serviceCategory: categoryFilter || undefined,
                        })
                          .then(() => toastSuccess("CSV download started."))
                          .catch((err) =>
                            toastError(
                              err instanceof ApiError ? err.message : "Could not export CSV",
                            ),
                          )
                          .finally(() => setExportingCsv(false));
                      }}
                    >
                      Export CSV
                    </Button>
                    <label className="flex w-full items-center gap-2 sm:w-auto">
                      <span className="hidden text-xs text-slate-500 sm:inline">
                        {t("hearing", "desk.filterStatus")}
                      </span>
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        aria-label={t("hearing", "desk.filterStatus")}
                        className="w-full rounded-lg border px-2 py-1.5 text-sm sm:w-auto"
                      >
                        <option value="">{t("hearing", "desk.all")}</option>
                        <option value="pending">{t("hearing", "desk.statusPending")}</option>
                        <option value="approved">{t("hearing", "desk.statusApproved")}</option>
                        <option value="rejected">{t("hearing", "desk.statusRejected")}</option>
                      </select>
                    </label>
                    <label className="flex w-full items-center gap-2 sm:w-auto">
                      <span className="hidden text-xs text-slate-500 sm:inline">
                        {t("hearing", "desk.filterCategory")}
                      </span>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        aria-label={t("hearing", "desk.filterCategory")}
                        className="w-full rounded-lg border px-2 py-1.5 text-sm sm:w-auto"
                      >
                        <option value="">{t("hearing", "desk.all")}</option>
                        {HEARING_DESK_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {t("hearing", cat.key)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={t("hearing", "desk.downloadPdf")}
                          title={t("hearing", "desk.downloadPdf")}
                          onClick={() => downloadRegistrationPdf(row.id)}
                        >
                          <Icon name="download" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={t("hearing", "desk.sendWhatsApp")}
                          title={t("hearing", "desk.sendWhatsApp")}
                          onClick={() => {
                            setWhatsappRegId(row.id);
                            setWhatsappDraft("");
                          }}
                        >
                          <Icon name="message" size={16} />
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
                              <Button
                                size="sm"
                                variant="ghost"
                                aria-label={t("hearing", "desk.downloadPdf")}
                                title={t("hearing", "desk.downloadPdf")}
                                onClick={() => downloadRegistrationPdf(row.id)}
                              >
                                <Icon name="download" size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                aria-label={t("hearing", "desk.sendWhatsApp")}
                                title={t("hearing", "desk.sendWhatsApp")}
                                onClick={() => {
                                  setWhatsappRegId(row.id);
                                  setWhatsappDraft("");
                                }}
                              >
                                <Icon name="message" size={16} />
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

      {confirmDelete && hearing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            onClick={() => !busy && setConfirmDelete(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-hearing-title"
            className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-5"
          >
            <h3 id="delete-hearing-title" className="text-lg font-semibold text-slate-900">
              Delete hearing?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              You are about to permanently delete{" "}
              <span className="font-semibold text-slate-900">&ldquo;{hearing.title}&rdquo;</span>.
            </p>
            {(stats?.total ?? 0) > 0 ? (
              <p className="mt-3 rounded-lg border border-danger/20 bg-red-50 px-3 py-2 text-sm text-danger">
                This removes {stats?.total} registration
                {(stats?.total ?? 0) === 1 ? "" : "s"} and linked grievances. This cannot be undone.
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-500">This action cannot be undone.</p>
            )}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                disabled={busy}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={busy}
                className="w-full sm:w-auto"
                onClick={() =>
                  void runAction(
                    async () => {
                      const res = await deleteHearing(hearing.id);
                      setConfirmDelete(false);
                      setSelectedId(null);
                      return res;
                    },
                    { skipReloadSelected: true },
                  )
                }
              >
                Delete hearing
              </Button>
            </div>
          </div>
        </div>
      ) : null}

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

      {whatsappRegId && hearing && whatsappTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hearing-whatsapp-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !whatsappSending) {
              setWhatsappRegId(null);
              setWhatsappDraft("");
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-5">
            <h3 id="hearing-whatsapp-title" className="text-lg font-semibold">
              {t("hearing", "desk.whatsappTitle")}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{t("hearing", "desk.whatsappHint")}</p>
            <p className="mt-3 rounded-lg bg-surface-muted px-3 py-2 text-sm text-slate-800">
              <span className="font-medium">{whatsappTarget.citizen_name}</span>
              <span className="text-slate-500"> · {whatsappTarget.citizen_phone}</span>
            </p>
            <textarea
              value={whatsappDraft}
              onChange={(e) => setWhatsappDraft(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder={t("hearing", "desk.whatsappPlaceholder")}
              className="mt-3 w-full rounded-xl border px-3 py-2 text-sm"
            />
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                disabled={whatsappSending}
                onClick={() => {
                  setWhatsappRegId(null);
                  setWhatsappDraft("");
                }}
              >
                {t("hearing", "desk.whatsappCancel")}
              </Button>
              <Button
                loading={whatsappSending}
                disabled={!whatsappDraft.trim() || whatsappSending}
                className="w-full sm:w-auto"
                onClick={() => {
                  const text = whatsappDraft.trim();
                  if (!text) return;
                  setWhatsappSending(true);
                  void sendHearingRegistrationWhatsApp(hearing.id, whatsappRegId, text)
                    .then(() => {
                      toastSuccess(t("hearing", "desk.whatsappQueued"));
                      setWhatsappRegId(null);
                      setWhatsappDraft("");
                    })
                    .catch((err) =>
                      toastError(
                        err instanceof ApiError
                          ? err.message
                          : t("hearing", "desk.whatsappFailed"),
                      ),
                    )
                    .finally(() => setWhatsappSending(false));
                }}
              >
                {t("hearing", "desk.whatsappSend")}
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
                  <DetailField label="Address" value={selectedReg.citizen_address || "-"} />
                  {selectedReg.citizen_pincode ? (
                    <DetailField label="Pincode" value={selectedReg.citizen_pincode} />
                  ) : null}
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
