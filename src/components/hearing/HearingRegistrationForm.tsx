"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "@/components/icons/Icon";
import { GovtNavbar } from "@/components/shell/GovtNavbar";
import { PortalFooter } from "@/components/shell/PortalFooter";
import { Button } from "@/components/ui/Button";
import { SectionLoader } from "@/components/ui/Spinner";
import { ToastViewport, useToast } from "@/components/ui/Toast";
import { HearingFieldLabel, HearingSelectField } from "@/components/hearing/HearingSelectField";
import { downloadPublicHearingRegistrationPdf, registerForHearing } from "@/lib/api/hearing";
import { ApiError } from "@/lib/api/client";
import {
  formatHearingSubmitError,
  invalidPhoneMessage,
  missingFieldsMessage,
} from "@/lib/hearing/registrationErrors";
import { formatHearingWhen } from "@/lib/hearing/formatWhen";
import { resolveHearingContent } from "@/lib/hearing/resolveContent";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";
import type { HearingPublicSummary, HearingRegisterResult } from "@/types/api";

const SERVICE_CATEGORIES = [
  { value: "Commerce & Transport", key: "categories.commerce" },
  { value: "Steel & Mines", key: "categories.steel" },
  { value: "Ganjam District", key: "categories.ganjam" },
  { value: "Gopalpur Constituency", key: "categories.gopalpur" },
  { value: "Others", key: "categories.others" },
] as const;

const LANGUAGE_VALUES = ["or", "en", "hi"] as const;

const STEP_DEFS = [
  { id: "personal", labelKey: "register.stepPersonal" },
  { id: "grievance", labelKey: "register.stepGrievance" },
  { id: "attachments", labelKey: "register.stepFiles" },
  { id: "review", labelKey: "register.stepReview" },
] as const;

type Props = {
  hearing: HearingPublicSummary;
};

export function HearingRegistrationForm({ hearing }: Props) {
  const { locale: uiLocale, t } = useI18n();
  const H = (key: string, params?: Record<string, string | number>) => t("hearing", key, params);
  const content = resolveHearingContent(hearing, uiLocale);
  const STEPS = STEP_DEFS.map((step) => ({ id: step.id, label: H(step.labelKey) }));
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitErrorRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [serviceCategory, setServiceCategory] = useState("");
  const [citizenAddress, setCitizenAddress] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [phoneDigits, setPhoneDigits] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("or");
  const [imageModal, setImageModal] = useState<{
    url: string;
    name: string;
    kind: "image" | "video";
  } | null>(null);
  const [filePreviews, setFilePreviews] = useState<
    { id: string; name: string; url: string; kind: "image" | "video" | "pdf" | "other"; size: number }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registrationResult, setRegistrationResult] = useState<HearingRegisterResult | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { toasts, success: toastSuccess, error: toastError, dismiss: dismissToast } = useToast();

  const mediaPreviewUrls = useMemo(
    () => filePreviews.filter((p) => p.kind === "image" || p.kind === "video"),
    [filePreviews],
  );

  useEffect(() => {
    const entries = files.map((file) => {
      const kind = detectFileKind(file);
      return {
        id: fileFingerprint(file),
        name: file.name,
        url: kind === "image" || kind === "video" ? URL.createObjectURL(file) : "",
        kind,
        size: file.size,
      };
    });
    setFilePreviews(entries);
    return () => {
      entries.forEach((entry) => {
        if (entry.url) URL.revokeObjectURL(entry.url);
      });
    };
  }, [files]);

  useEffect(() => {
    if (!imageModal) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setImageModal(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [imageModal]);

  const isLastStep = activeStep === STEPS.length - 1;
  const isFirstStep = activeStep === 0;

  function isCurrentStepValid(): boolean {
    const form = formRef.current;
    if (!form) return false;

    const panel = form.querySelector<HTMLElement>(`[data-step-panel="${activeStep}"]`);
    if (!panel) return false;

    const fields = panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input:not([type='hidden']):not([type='file']), select:not(.sr-only), textarea",
    );

    for (const field of fields) {
      if (!field.checkValidity()) return false;
    }

    for (const select of panel.querySelectorAll<HTMLSelectElement>("select.sr-only")) {
      if (!select.checkValidity()) return false;
    }

    if (activeStep === 0 && !/^[6-9]\d{9}$/.test(phoneDigits)) return false;
    if (activeStep === 0 && citizenAddress.trim().length < 5) return false;
    if (activeStep === 1 && !serviceCategory) return false;

    return true;
  }

  useEffect(() => {
    if (error && activeStep !== STEPS.length - 1 && isCurrentStepValid()) {
      setError(null);
    }
  }, [error, activeStep, phoneDigits, serviceCategory, citizenAddress]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    function tryClearStepError() {
      if (activeStep === STEPS.length - 1) return;
      setError((current) => (current && isCurrentStepValid() ? null : current));
    }

    form.addEventListener("input", tryClearStepError);
    form.addEventListener("change", tryClearStepError);
    return () => {
      form.removeEventListener("input", tryClearStepError);
      form.removeEventListener("change", tryClearStepError);
    };
  }, [activeStep, phoneDigits, serviceCategory, citizenAddress]);

  function validateCurrentStep(): boolean {
    const form = formRef.current;
    if (!form) return false;

    const panel = form.querySelector<HTMLElement>(`[data-step-panel="${activeStep}"]`);
    if (!panel) return false;

    const fields = panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input:not([type='hidden']):not([type='file']), select:not(.sr-only), textarea",
    );

    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }

    if (isCurrentStepValid()) {
      setError(null);
      return true;
    }

    for (const select of panel.querySelectorAll<HTMLSelectElement>("select.sr-only")) {
      if (!select.checkValidity()) {
        setError(H("register.errSelectOption"));
        return false;
      }
    }

    if (activeStep === 0) {
      if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
        setError(H("register.errPhone"));
        return false;
      }
      if (citizenAddress.trim().length < 5) {
        setError(H("register.errAddress"));
        return false;
      }
    }

    if (activeStep === 1 && !serviceCategory) {
      setError(H("register.errCategory"));
      return false;
    }

    return false;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrev() {
    setError(null);
    setSubmitError(null);
    setActiveStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToStep(index: number) {
    if (index <= activeStep) {
      setError(null);
      setSubmitError(null);
      setActiveStep(index);
    }
  }

  function showSubmitError(message: string) {
    setSubmitError(message);
    requestAnimationFrame(() => {
      submitErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function readFormValue(name: string): string {
    const form = formRef.current;
    if (!form) return "";
    const field = form.elements.namedItem(name);
    if (!field) return "";
    if (field instanceof RadioNodeList) {
      const selected = Array.from(field).find(
        (node): node is HTMLInputElement =>
          node instanceof HTMLInputElement && node.checked,
      );
      return selected?.value.trim() ?? "";
    }
    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      return field.value.trim();
    }
    return "";
  }

  function buildSubmitFormData(): FormData {
    const form = new FormData();

    form.set("citizen_name", readFormValue("citizen_name"));
    form.set("citizen_address", citizenAddress.trim());
    form.set("citizen_email", readFormValue("citizen_email"));
    form.set("preferred_language", readFormValue("preferred_language") || "or");
    form.set("title", readFormValue("title"));
    form.set("grievance_text", readFormValue("grievance_text"));
    form.set("area", "");
    form.set("citizen_phone", phoneDigits);
    form.set("service_category", serviceCategory);
    form.set("department", "");
    form.set("sub_department", "");
    form.set("issue_type", "");
    form.set("organization", "");
    form.set("geographic_district", "");
    form.set("constituency", "");

    for (const file of files) {
      form.append("files", file);
    }
    return form;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLastStep) {
      goNext();
      return;
    }

    setError(null);
    setSubmitError(null);
    setRegistrationResult(null);

    const lang = uiLocale;

    if (!acceptedTerms) {
      toastError(H("register.toastAcceptTerms"));
      return;
    }

    setSubmitting(true);

    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      showSubmitError(invalidPhoneMessage(lang));
      setSubmitting(false);
      return;
    }

    const required: { key: string; label: string; value: string }[] = [
      { key: "citizen_name", label: H("register.missingName"), value: readFormValue("citizen_name") },
      { key: "citizen_address", label: H("register.missingAddress"), value: citizenAddress.trim() },
      { key: "service_category", label: H("register.missingCategory"), value: serviceCategory },
      { key: "title", label: H("register.missingTitle"), value: readFormValue("title") },
      { key: "grievance_text", label: H("register.missingDetails"), value: readFormValue("grievance_text") },
    ];
    const missing = required.filter((item) => !item.value || (item.key === "citizen_address" && item.value.length < 5));
    if (missing.length > 0) {
      showSubmitError(missingFieldsMessage(lang, missing.map((m) => m.label)));
      setSubmitting(false);
      return;
    }

    const form = buildSubmitFormData();

    try {
      const res = await registerForHearing(hearing.id, form);
      setRegistrationResult(res.data);
      toastSuccess(H("register.toastSuccess"));
      setAcceptedTerms(false);
      setSubmitError(null);
      event.currentTarget.reset();
      setActiveStep(0);
      setServiceCategory("");
      setCitizenAddress("");
      setFiles([]);
      setPhoneDigits("");
      setPreferredLanguage("or");
      setFileUploadError(null);
      setImageModal(null);
    } catch (err) {
      showSubmitError(formatHearingSubmitError(err, uiLocale));
    } finally {
      setSubmitting(false);
    }
  }

  function openFilePicker() {
    if (files.length >= 3) return;
    setFileUploadError(null);
    fileInputRef.current?.click();
  }

  function onFileChange(list: FileList | null) {
    if (!list || list.length === 0) return;

    const incoming = Array.from(list);
    const errors: string[] = [];
    const accepted: File[] = [];

    for (const file of incoming) {
      const validationError = validateUploadFile(file, H);
      if (validationError) {
        errors.push(validationError);
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) {
      setFileUploadError(errors[0] ?? H("register.fileNone"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFiles((prev) => {
      const merged = [...prev];
      for (const file of accepted) {
        if (merged.length >= 3) {
          errors.push(H("register.fileMax"));
          break;
        }
        const duplicate = merged.some((existing) => filesMatch(existing, file));
        if (!duplicate) merged.push(file);
      }
      return merged;
    });

    if (errors.length > 0) {
      setFileUploadError(errors.join(" "));
    } else {
      setFileUploadError(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeFile(target: File) {
    setFiles((prev) => prev.filter((file) => !filesMatch(file, target)));
    setFileUploadError(null);
    setImageModal((current) =>
      current && current.name === target.name ? null : current,
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const reviewSnapshot = useMemo(() => {
    const form = formRef.current;
    const field = (name: string) => {
      if (!form) return "";
      const el = form.elements.namedItem(name);
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
      ) {
        return el.value.trim();
      }
      return "";
    };

    return {
      name: field("citizen_name"),
      phone: phoneDigits ? `+91 ${phoneDigits}` : "",
      address: citizenAddress.trim(),
      email: field("citizen_email"),
      language: H(`languages.${field("preferred_language") || "or"}`),
      category: (() => {
        const match = SERVICE_CATEGORIES.find((c) => c.value === serviceCategory);
        return match ? H(match.key) : serviceCategory;
      })(),
      title: field("title"),
      grievanceText: field("grievance_text"),
      attachments: filePreviews,
    };
  }, [activeStep, serviceCategory, filePreviews, phoneDigits, citizenAddress, t]);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <GovtNavbar homeHref="/" />

      {/* Hearing header - flat, no shadow */}
      <section className="border-b-2 border-saffron/20 bg-white">
        <div className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="font-medium text-navy-700 hover:text-saffron hover:underline">
              {t("common", "brand.name")}
            </Link>
            <Icon name="chevron-right" size={14} className="text-slate-400" />
            <Link href="/hearing" className="font-medium text-navy-700 hover:text-saffron hover:underline">
              {H("list.breadcrumb")}
            </Link>
            <Icon name="chevron-right" size={14} className="text-slate-400" />
            <span className="truncate text-slate-600">{H("register.breadcrumbRegister")}</span>
          </nav>

          <p className="mt-6 block text-xs font-bold uppercase tracking-wide text-saffron sm:tracking-[0.18em]">
            {H("register.kicker")}
          </p>
          <h1 className="mt-3 wrap-break-word text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem] lg:leading-tight">
            {content.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <MetaPill label={H("register.hearingLabel")} value={formatHearingWhen(hearing.hearing_date, uiLocale)} highlight />
            <MetaPill label={H("register.closesLabel")} value={formatHearingWhen(hearing.registration_closes_at, uiLocale)} />
            <span
              className={cn(
                "inline-flex max-w-full items-center rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                hearing.registration_open
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-600",
              )}
            >
              {hearing.registration_open ? H("register.registrationOpen") : H("register.registrationClosed")}
            </span>
          </div>
        </div>
      </section>

      {/* Form body - full width, flat */}
      <main className="mx-auto w-full max-w-[1920px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {!hearing.registration_open ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-8 text-center">
            <p className="text-lg font-semibold text-amber-900">{H("register.closedTitle")}</p>
            <p className="mt-2 text-sm text-amber-800">
              {H("register.closedBody")}
            </p>
            <Link
              href="/hearing"
              className="mt-6 inline-flex rounded-lg bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-600"
            >
              {H("register.viewAll")}
            </Link>
          </div>
        ) : registrationResult ? (
          <RegistrationSuccessPanel
            result={registrationResult}
            hearing={hearing}
            onDownloadError={toastError}
          />
        ) : (
          <div className="rounded-lg border border-border bg-white">
            {/* Step stepper - connected, flat */}
            <div className="overflow-hidden rounded-t-lg border-b border-border bg-surface-muted px-4 py-5 sm:px-8">
              <ol className="flex items-start overflow-x-auto pb-1">
                {STEPS.map((step, index) => {
                  const done = index < activeStep;
                  const current = index === activeStep;
                  const last = index === STEPS.length - 1;
                  return (
                    <li key={step.id} className={cn("flex items-start", !last && "flex-1")}>
                      <button
                        type="button"
                        onClick={() => goToStep(index)}
                        disabled={index > activeStep}
                        className={cn(
                          "group flex shrink-0 flex-col items-center gap-2 text-center",
                          index <= activeStep ? "cursor-pointer" : "cursor-not-allowed opacity-45",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors sm:h-10 sm:w-10 sm:text-sm",
                            current && "border-saffron bg-saffron text-white",
                            done && "border-emerald-600 bg-emerald-600 text-white",
                            !current && !done && "border-slate-300 bg-white text-slate-500",
                          )}
                        >
                          {done ? "✓" : index + 1}
                        </span>
                        <span
                          className={cn(
                            "hidden max-w-[5.5rem] text-[11px] font-semibold leading-tight sm:block sm:max-w-none sm:text-xs",
                            current ? "text-saffron" : done ? "text-emerald-700" : "text-slate-500",
                          )}
                        >
                          {step.label}
                        </span>
                      </button>
                      {!last ? (
                        <div
                          className={cn(
                            "hearing-stepper-line mx-1 sm:mx-2",
                            done && "is-done",
                          )}
                          aria-hidden
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-center text-xs font-semibold text-saffron sm:hidden">
                {STEPS[activeStep].label}
              </p>
            </div>

            <form ref={formRef} onSubmit={onSubmit} className="relative flex min-w-0 flex-col">
              {submitting ? (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-[1px]"
                  aria-live="polite"
                  aria-busy
                >
                  <SectionLoader label={H("register.submitting")} />
                </div>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf,video/mp4,video/3gpp,video/3gp,.jpg,.jpeg,.png,.pdf,.mp4,.3gp"
                multiple
                tabIndex={-1}
                aria-hidden
                onChange={(e) => onFileChange(e.target.files)}
                className="pointer-events-none absolute h-0 w-0 opacity-0"
              />
              <div className="min-h-[400px] min-w-0 border-b border-border px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
                {/* Step 0 - Personal */}
                <StepPanel step={0} activeStep={activeStep} title={H("register.stepPersonal")} subtitle={H("register.stepPersonalSub")}>
                  <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 *:min-w-0">
                    <Field label={H("register.fullName")} name="citizen_name" required />
                    <PhoneField digits={phoneDigits} onChange={setPhoneDigits} />
                    <input type="hidden" name="citizen_phone" value={phoneDigits} />
                    <label className="block min-w-0 sm:col-span-2 lg:col-span-3">
                      <HearingFieldLabel label={H("register.address")} />
                      <textarea
                        name="citizen_address"
                        required
                        minLength={5}
                        maxLength={500}
                        rows={3}
                        placeholder={H("register.addressPlaceholder")}
                        value={citizenAddress}
                        onChange={(e) => setCitizenAddress(e.target.value)}
                        className="hearing-form-input min-h-24 resize-y"
                      />
                    </label>
                    <Field label={H("register.email")} name="citizen_email" type="email" />
                    <HearingSelectField
                      label={H("register.preferredLanguage")}
                      name="preferred_language"
                      value={preferredLanguage}
                      onChange={setPreferredLanguage}
                      options={LANGUAGE_VALUES.map((lang) => ({ value: lang, label: H(`languages.${lang}`) }))}
                    />
                  </div>
                </StepPanel>

                {/* Step 1 - Grievance (+ related to) */}
                <StepPanel step={1} activeStep={activeStep} title={H("register.stepGrievanceTitle")} subtitle={H("register.stepGrievanceSub")}>
                  <div className="grid min-w-0 gap-5 lg:grid-cols-2 *:min-w-0">
                    <div className="lg:col-span-2">
                      <Field label={H("register.grievanceTitle")} name="title" required placeholder={H("register.grievanceTitlePlaceholder")} />
                    </div>
                    <div className="lg:col-span-2">
                      <HearingSelectField
                        label={H("register.serviceCategory")}
                        name="service_category"
                        required
                        value={serviceCategory}
                        onChange={setServiceCategory}
                        placeholder={H("register.selectCategory")}
                        options={SERVICE_CATEGORIES.map((c) => ({ value: c.value, label: H(c.key) }))}
                      />
                    </div>
                    <label className="block text-sm lg:col-span-2">
                      <span className="mb-1.5 block font-medium text-slate-700">
                        {H("register.grievanceDetails")}
                      </span>
                      <textarea
                        name="grievance_text"
                        required
                        minLength={10}
                        rows={6}
                        placeholder={H("register.grievanceDetailsPlaceholder")}
                        className="hearing-form-input min-h-[9rem] resize-y"
                      />
                    </label>
                  </div>
                </StepPanel>

                {/* Step 2 - Attachments */}
                <StepPanel step={2} activeStep={activeStep} title={H("register.stepFilesTitle")}>
                  <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                    <div>
                      <div className="rounded-lg border-2 border-dashed border-slate-300 bg-surface-muted px-6 py-10 text-center">
                        <p className="text-sm font-medium text-slate-700">
                          {H("register.uploadTitle")}
                          {files.length > 0 ? (
                            <span className="text-slate-500"> {H("register.uploadAdded", { count: files.length })}</span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {H("register.uploadLimits")}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {H("register.uploadHint")}
                        </p>
                        <button
                          type="button"
                          disabled={files.length >= 3}
                          onClick={openFilePicker}
                          className={cn(
                            "mt-5 inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold text-white",
                            files.length >= 3
                              ? "cursor-not-allowed bg-slate-400"
                              : "bg-navy-700 hover:bg-navy-600",
                          )}
                        >
                          {files.length >= 3 ? H("register.maxFiles") : H("register.chooseFiles")}
                        </button>
                      </div>
                      {fileUploadError ? (
                        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
                          {fileUploadError}
                        </p>
                      ) : null}
                      {files.length > 0 ? (
                        <ul className="mt-4 space-y-2">
                          {files.map((f) => (
                            <li
                              key={fileFingerprint(f)}
                              className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm"
                            >
                              <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
                                {f.name}
                              </span>
                              <span className="shrink-0 text-slate-500">
                                {Math.round(f.size / 1024)} KB
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFile(f)}
                                className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                              >
                                {H("register.remove")}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <AttachmentPreviewPanel
                      previews={mediaPreviewUrls}
                      onPreview={(preview) =>
                        setImageModal({
                          url: preview.url,
                          name: preview.name,
                          kind: preview.kind === "video" ? "video" : "image",
                        })
                      }
                    />
                  </div>
                </StepPanel>

                {/* Step 3 - Review */}
                <StepPanel step={3} activeStep={activeStep}>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ReviewBlock title={H("register.reviewPersonal")}>
                      <ReviewRow label={H("register.reviewName")} value={reviewSnapshot.name} />
                      <ReviewRow label={H("register.reviewPhone")} value={reviewSnapshot.phone} />
                      <ReviewRow label={H("register.reviewAddress")} value={reviewSnapshot.address} />
                      <ReviewRow label={H("register.reviewEmail")} value={reviewSnapshot.email} />
                      <ReviewRow label={H("register.reviewLanguage")} value={reviewSnapshot.language} />
                    </ReviewBlock>
                    <ReviewBlock title={H("register.reviewGrievance")} className="lg:col-span-2">
                      <ReviewRow label={H("register.reviewTitle")} value={reviewSnapshot.title} />
                      <ReviewRow label={H("register.reviewCategory")} value={reviewSnapshot.category} />
                      <div className="mt-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {H("register.reviewDetails")}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                          {reviewSnapshot.grievanceText || "-"}
                        </p>
                      </div>
                    </ReviewBlock>
                    <ReviewBlock title={H("register.reviewAttachments")} className="lg:col-span-2">
                      {reviewSnapshot.attachments.length > 0 ? (
                        <ReviewAttachmentsGrid
                          items={reviewSnapshot.attachments}
                          onPreview={(item) => {
                            if (item.kind === "image" || item.kind === "video") {
                              setImageModal({
                                url: item.url,
                                name: item.name,
                                kind: item.kind,
                              });
                            }
                          }}
                        />
                      ) : (
                        <p className="text-sm text-slate-500">{H("register.noFiles")}</p>
                      )}
                    </ReviewBlock>
                  </div>

                  <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-muted px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        if (e.target.checked) {
                          setSubmitError(null);
                        }
                      }}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-saffron"
                    />
                    <span className="text-xs leading-relaxed text-slate-700">
                      {H("register.termsPrefix")}{" "}
                      <Link
                        href="/hearing/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-navy-700 underline hover:text-saffron"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {H("register.termsLink")}
                      </Link>{" "}
                      {H("register.termsSuffix")}
                    </span>
                  </label>
                </StepPanel>

                {error ? (
                  <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                  </p>
                ) : null}
              </div>

              {/* Footer navigation - flat bar */}
              <div className="flex flex-col gap-3 rounded-b-lg bg-surface-muted px-4 py-4 sm:px-8 lg:px-12">
                {submitError && isLastStep ? (
                  <div
                    ref={submitErrorRef}
                    role="alert"
                    className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-900"
                  >
                    {submitError}
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goPrev}
                  disabled={isFirstStep || submitting}
                  className="min-w-[120px]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon name="back" size={16} />
                    {H("register.previous")}
                  </span>
                </Button>

                <p className="hidden text-sm font-medium text-slate-500 sm:block">
                  {H("register.stepOf", {
                    current: activeStep + 1,
                    total: STEPS.length,
                    label: STEPS[activeStep].label,
                  })}
                </p>

                {isLastStep ? (
                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={submitting}
                    className="min-w-[140px]"
                  >
                    {H("register.submit")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={goNext}
                    disabled={submitting}
                    className="min-w-[120px]"
                  >
                    <span className="inline-flex items-center gap-2">
                      {H("register.next")}
                      <Icon name="chevron-right" size={16} />
                    </span>
                  </Button>
                )}
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      <PortalFooter />

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />

      {imageModal ? (
        <MediaPreviewModal preview={imageModal} onClose={() => setImageModal(null)} />
      ) : null}
    </div>
  );
}

function detectFileKind(file: File): "image" | "video" | "pdf" | "other" {
  const mime = file.type.toLowerCase().split(";", 1)[0]?.trim() ?? "";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "jpg" || ext === "jpeg" || ext === "png") return "image";
  if (ext === "mp4" || ext === "3gp" || ext === "3gpp") return "video";
  if (ext === "pdf") return "pdf";
  return "other";
}

function validateUploadFile(
  file: File,
  t: (key: string, params?: Record<string, string | number>) => string,
): string | null {
  const kind = detectFileKind(file);
  if (kind === "other") {
    return t("register.fileUnsupported", { name: file.name });
  }
  const maxBytes = kind === "video" ? 16 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return t("register.fileTooLarge", { name: file.name, max: kind === "video" ? "16" : "5" });
  }
  return null;
}

function fileFingerprint(file: File) {
  return `${file.name}-${file.lastModified}-${file.size}`;
}

function filesMatch(a: File, b: File) {
  return (
    a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
  );
}

function AttachmentPreviewPanel({
  previews,
  onPreview,
}: {
  previews: {
    id: string;
    name: string;
    url: string;
    kind: "image" | "video" | "pdf" | "other";
  }[];
  onPreview: (preview: (typeof previews)[number]) => void;
}) {
  const { t } = useI18n();
  const H = (key: string, params?: Record<string, string | number>) => t("hearing", key, params);

  if (previews.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted px-6 py-8 text-center lg:min-h-[280px]">
        <p className="text-sm font-medium text-slate-600">{H("register.previewEmptyTitle")}</p>
        <p className="mt-1 text-xs text-slate-500">
          {H("register.previewEmptyBody")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
        {H("register.previewCount", { count: previews.length })}
      </p>
      <div className="grid max-h-[420px] gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-1">
        {previews.map((preview) => (
          <button
            key={preview.id}
            type="button"
            onClick={() => onPreview(preview)}
            className="group overflow-hidden rounded-lg border border-border bg-surface-muted text-left transition-colors hover:border-saffron focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              {preview.kind === "video" ? (
                <>
                  <video
                    src={preview.url}
                    className="h-full w-full object-contain"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-xs font-semibold text-white">
                    {H("register.playVideo")}
                  </span>
                </>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
              )}
            </div>
            <p className="truncate px-3 py-2 text-xs font-medium text-slate-700">{preview.name}</p>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">{H("register.previewHint")}</p>
    </div>
  );
}

function MediaPreviewModal({
  preview,
  onClose,
}: {
  preview: { url: string; name: string; kind: "image" | "video" };
  onClose: () => void;
}) {
  const { t } = useI18n();
  const H = (key: string, params?: Record<string, string | number>) => t("hearing", key, params);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={H("register.previewAria", { name: preview.name })}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-white/20 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="truncate text-sm font-semibold text-slate-900">{preview.name}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-navy-700 hover:bg-surface-muted"
          >
            {H("register.close")}
          </button>
        </div>
        <div className="flex max-h-[calc(90vh-3.5rem)] items-center justify-center bg-slate-900/95 p-4">
          {preview.kind === "video" ? (
            <video
              src={preview.url}
              controls
              className="max-h-[calc(90vh-6rem)] max-w-full"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={preview.url}
              alt={preview.name}
              className="max-h-[calc(90vh-6rem)] max-w-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RegistrationSuccessPanel({
  result,
  hearing,
  onDownloadError,
}: {
  result: HearingRegisterResult;
  hearing: HearingPublicSummary;
  onDownloadError: (message: string) => void;
}) {
  const { locale, t } = useI18n();
  const H = (key: string, params?: Record<string, string | number>) => t("hearing", key, params);
  const hearingWhen = formatHearingWhen(hearing.hearing_date, locale);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadPublicHearingRegistrationPdf(
        result.hearing_id,
        result.registration_id,
        result.reference_number,
        locale,
      );
    } catch (err) {
      onDownloadError(
        err instanceof ApiError ? err.message : H("success.pdfFailed"),
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-emerald-200 bg-white">
      <div className="border-b border-emerald-100 bg-emerald-50/50 px-4 py-10 text-center sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500 text-xl font-bold text-emerald-700">
          ✓
        </div>
        <h2 className="mt-4 wrap-break-word text-2xl font-bold text-slate-900 sm:text-3xl">{H("success.title")}</h2>
        <p className="mx-auto mt-2 max-w-4xl wrap-break-word text-sm leading-relaxed text-slate-600 sm:text-base">
          {H("success.lead")}
        </p>

        <div className="mx-auto mt-8 max-w-4xl rounded-lg border-2 border-saffron/40 bg-saffron/5 px-5 py-6 lg:max-w-none">
          <p className="wrap-break-word text-xs font-bold uppercase tracking-wide text-saffron sm:tracking-[0.16em]">
            {H("success.refLabel")}
          </p>
          <p className="mt-2 break-all font-mono text-2xl font-bold tracking-wide text-navy-900 sm:text-3xl lg:text-4xl">
            {result.reference_number}
          </p>
          <p className="mt-2 text-xs text-slate-600 sm:text-sm">
            {H("success.refHint")}
          </p>
          <div className="mt-5 flex flex-col items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={downloading}
              onClick={() => void handleDownloadPdf()}
              className="inline-flex items-center gap-2"
            >
              <Icon name="download" size={16} />
              {H("success.downloadPdf")}
            </Button>
            <p className="text-xs text-slate-500">{H("success.downloadHint")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-4 py-8 sm:px-8 lg:grid-cols-2 lg:gap-8 lg:px-12 lg:py-10">
        <SuccessInfoBlock title={H("success.whatIsTitle")}>
          <p>{H("success.whatIsBody")}</p>
        </SuccessInfoBlock>

        <SuccessInfoBlock title={H("success.howTitle")}>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>{H("success.how1")}</li>
            <li>{H("success.how2")}</li>
            <li>{H("success.how3")}</li>
          </ul>
        </SuccessInfoBlock>

        <SuccessInfoBlock title={H("success.nextTitle")} className="lg:col-span-2">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="rounded-lg border border-border bg-surface-muted p-4">
              <span className="font-medium text-slate-900">{H("success.next1Title")}</span>
              <span className="mt-1 block text-sm text-slate-600">
                {H("success.next1Body", { when: hearingWhen })}
              </span>
            </li>
            <li className="rounded-lg border border-border bg-surface-muted p-4">
              <span className="font-medium text-slate-900">{H("success.next2Title")}</span>
              <span className="mt-1 block text-sm text-slate-600">
                {H("success.next2Body")}
              </span>
            </li>
            <li className="rounded-lg border border-border bg-surface-muted p-4">
              <span className="font-medium text-slate-900">{H("success.next3Title")}</span>
              <span className="mt-1 block text-sm text-slate-600">
                {H("success.next3Body")}
              </span>
            </li>
            <li className="rounded-lg border border-border bg-surface-muted p-4">
              <span className="font-medium text-slate-900">{H("success.next4Title")}</span>
              <span className="mt-1 block text-sm text-slate-600">
                {H("success.next4Body")}
              </span>
            </li>
          </ol>
        </SuccessInfoBlock>

        <SuccessInfoBlock title={H("success.resolveTitle")} className="lg:col-span-2">
          <ul className="grid gap-3 sm:grid-cols-3">
            <li className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
              {H("success.resolve1")}
            </li>
            <li className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
              {H("success.resolve2")}
            </li>
            <li className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
              {H("success.resolve3")}
            </li>
          </ul>
        </SuccessInfoBlock>
      </div>

      <p className="mx-4 mb-8 rounded-lg border border-border bg-surface-muted px-4 py-3 text-center text-xs leading-relaxed text-slate-600 sm:mx-8 lg:mx-12">
        {H("success.footer")}
      </p>
    </div>
  );
}

function SuccessInfoBlock({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0 text-sm leading-relaxed text-slate-700", className)}>
      <h3 className="wrap-break-word text-sm font-bold text-navy-800">{title}</h3>
      <div className="mt-2 min-w-0 wrap-break-word">{children}</div>
    </section>
  );
}

function MetaPill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex min-w-0 max-w-full flex-col rounded-lg border px-3 py-2 sm:min-w-48",
        highlight
          ? "border-saffron/40 bg-saffron/5"
          : "border-border bg-white",
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="mt-0.5 wrap-break-word whitespace-normal text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function StepPanel({
  step,
  activeStep,
  title,
  subtitle,
  children,
}: {
  step: number;
  activeStep: number;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const isActive = step === activeStep;
  return (
    <div
      data-step-panel={step}
      className={cn("min-w-0", !isActive && "hidden")}
      aria-hidden={!isActive || undefined}
    >
      {isActive && title ? (
        <div className="mb-8 min-w-0 border-l-4 border-saffron pl-4">
          <h2 className="wrap-break-word text-xl font-bold text-slate-900 sm:text-2xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 wrap-break-word text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function ReviewBlock({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface-muted p-4", className)}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-navy-700">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  const display = value?.trim() || "-";
  return (
    <div className="flex min-w-0 flex-wrap gap-x-2 text-sm">
      <span className="font-medium text-slate-500">{label}:</span>
      <span className="min-w-0 wrap-break-word text-slate-900">{display}</span>
    </div>
  );
}

function ReviewAttachmentsGrid({
  items,
  onPreview,
}: {
  items: {
    id: string;
    name: string;
    url: string;
    kind: "image" | "video" | "pdf" | "other";
    size: number;
  }[];
  onPreview: (item: (typeof items)[number]) => void;
}) {
  const { t } = useI18n();
  const H = (key: string, params?: Record<string, string | number>) => t("hearing", key, params);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="overflow-hidden rounded-lg border border-border bg-white"
        >
          {item.kind === "image" ? (
            <button
              type="button"
              onClick={() => onPreview(item)}
              className="block w-full text-left"
            >
              <div className="aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-full w-full object-contain"
                />
              </div>
            </button>
          ) : item.kind === "video" ? (
            <button
              type="button"
              onClick={() => onPreview(item)}
              className="relative block w-full text-left"
            >
              <div className="aspect-[4/3] bg-slate-900">
                <video
                  src={item.url}
                  className="h-full w-full object-contain"
                  muted
                  playsInline
                  preload="metadata"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-sm font-semibold text-white">
                  {H("register.playVideo")}
                </span>
              </div>
            </button>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center bg-surface-muted px-4 text-center">
              <span className="text-2xl">{item.kind === "pdf" ? "PDF" : "FILE"}</span>
              <span className="mt-2 text-xs text-slate-600">
                {item.kind === "pdf" ? H("register.fileKindDocument") : H("register.fileKindAttachment")}
              </span>
            </div>
          )}
          <div className="border-t border-border px-3 py-2">
            <p className="truncate text-xs font-medium text-slate-800">{item.name}</p>
            <p className="text-[11px] text-slate-500">{Math.round(item.size / 1024)} KB</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhoneField({
  digits,
  onChange,
}: {
  digits: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  const H = (key: string, params?: Record<string, string | number>) => t("hearing", key, params);

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-semibold text-slate-800">
        {H("register.phone")}
      </span>
      <div className="flex">
        <span className="hearing-form-input inline-flex w-[4.25rem] shrink-0 items-center justify-center rounded-r-none border-r-0 bg-surface-muted font-semibold text-navy-700">
          +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required
          maxLength={10}
          minLength={10}
          pattern="[6-9][0-9]{9}"
          placeholder="9876543210"
          value={digits}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
          className="hearing-form-input min-w-0 flex-1 rounded-l-none"
          aria-label={H("register.phoneAria")}
        />
      </div>
    </label>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block min-w-0">
      <HearingFieldLabel label={label} hint={hint} />
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="hearing-form-input"
      />
    </label>
  );
}
