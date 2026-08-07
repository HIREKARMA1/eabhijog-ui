"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "@/components/icons/Icon";
import { GovtNavbar } from "@/components/shell/GovtNavbar";
import { PortalFooter } from "@/components/shell/PortalFooter";
import { Button } from "@/components/ui/Button";
import { SectionLoader } from "@/components/ui/Spinner";
import { HearingFieldLabel, HearingSelectField } from "@/components/hearing/HearingSelectField";
import { ApiError } from "@/lib/api/client";
import { fetchPublicRegistrationTaxonomy, registerForHearing } from "@/lib/api/hearing";
import {
  formatHearingSubmitError,
  invalidPhoneMessage,
  missingFieldsMessage,
  orgRequiredMessage,
  termsNotAcceptedMessage,
} from "@/lib/hearing/registrationErrors";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";
import type { HearingPublicSummary, HearingRegisterResult, PublicRegistrationTaxonomy } from "@/types/api";

const SERVICE_CATEGORIES = [
  "Commerce & Transport",
  "Steel & Mines",
  "Ganjam District",
  "Gopalpur Constituency",
];

const LANGUAGES = [
  { value: "or", label: "Odia" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];

const STEPS = [
  { id: "personal", label: "Your details", short: "Details" },
  { id: "category", label: "Category - department", short: "Category" },
  { id: "grievance", label: "Grievance", short: "Grievance" },
  { id: "attachments", label: "Attachments", short: "Files" },
  { id: "review", label: "Review - submit", short: "Submit" },
] as const;

type Props = {
  hearing: HearingPublicSummary;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function HearingRegistrationForm({ hearing }: Props) {
  const { locale: uiLocale } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitErrorRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [serviceCategory, setServiceCategory] = useState("");
  const [taxonomy, setTaxonomy] = useState<PublicRegistrationTaxonomy | null>(null);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const [subDepartment, setSubDepartment] = useState("");
  const [organization, setOrganization] = useState("");
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [issueType, setIssueType] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [phoneDigits, setPhoneDigits] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("or");
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null);
  const [taxonomyReloadKey, setTaxonomyReloadKey] = useState(0);
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

  useEffect(() => {
    if (!serviceCategory) {
      setTaxonomy(null);
      setTaxonomyError(null);
      return;
    }
    let cancelled = false;
    setTaxonomyLoading(true);
    setTaxonomyError(null);
    setDepartment("");
    setSubDepartment("");
    setOrganization("");
    setOrganizations([]);
    setOrganizationSearch("");
    setIssueType("");
    fetchPublicRegistrationTaxonomy(serviceCategory)
      .then((res) => {
        if (cancelled) return;
        if (!res.data?.departments?.length) {
          setTaxonomy(null);
          setTaxonomyError("No departments are configured for this category yet.");
          return;
        }
        setTaxonomy(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setTaxonomy(null);
        setTaxonomyError(
          err instanceof ApiError ? err.message : "Could not load department options. Please try again.",
        );
      })
      .finally(() => {
        if (!cancelled) setTaxonomyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceCategory, taxonomyReloadKey]);

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

  const selectedDept = useMemo(
    () => taxonomy?.departments.find((d) => d.name === department) ?? null,
    [taxonomy, department],
  );

  const selectedSub = useMemo(
    () => selectedDept?.sub_departments.find((s) => s.name === subDepartment) ?? null,
    [selectedDept, subDepartment],
  );

  const orgMultiSelect = useMemo(() => {
    if (!taxonomy?.organization_multi_select_department) return false;
    return department === taxonomy.organization_multi_select_department;
  }, [taxonomy, department]);

  const showSubDepartment =
    !!selectedDept && !selectedDept.skip_sub_steps && (selectedDept.sub_departments?.length ?? 0) > 0;

  const showOrganization =
    !!selectedSub &&
    !selectedDept?.skip_sub_steps &&
    (selectedSub.organizations?.length ?? 0) > 0;

  const showIssueType =
    !!selectedSub &&
    !selectedDept?.skip_sub_steps &&
    (selectedSub.issue_types?.length ?? 0) > 0;

  const deptLabel = taxonomy?.is_district_picker ? "Issue type" : "Department";
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

    if (activeStep === 1) {
      if (!serviceCategory) return false;
      if (orgMultiSelect && showOrganization && organizations.length === 0) return false;
    }

    return true;
  }

  useEffect(() => {
    if (error && activeStep !== STEPS.length - 1 && isCurrentStepValid()) {
      setError(null);
    }
  }, [
    error,
    activeStep,
    phoneDigits,
    serviceCategory,
    department,
    subDepartment,
    organization,
    organizations,
    issueType,
    orgMultiSelect,
    showOrganization,
    showSubDepartment,
    showIssueType,
  ]);

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
  }, [
    activeStep,
    phoneDigits,
    serviceCategory,
    department,
    subDepartment,
    organization,
    organizations,
    issueType,
    orgMultiSelect,
    showOrganization,
    showSubDepartment,
    showIssueType,
  ]);

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
        setError("Please select an option from the dropdown.");
        return false;
      }
    }

    if (activeStep === 0) {
      if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
        setError("Enter a valid 10-digit mobile number.");
        return false;
      }
    }

    if (activeStep === 1) {
      if (!serviceCategory) {
        setError("Please select a service category.");
        return false;
      }
      if (orgMultiSelect && showOrganization && organizations.length === 0) {
        setError("Please select at least one organization.");
        return false;
      }
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
    form.set("citizen_pincode", readFormValue("citizen_pincode"));
    form.set("citizen_email", readFormValue("citizen_email"));
    form.set("preferred_language", readFormValue("preferred_language") || "or");
    form.set("title", readFormValue("title"));
    form.set("grievance_text", readFormValue("grievance_text"));
    form.set("area", readFormValue("area"));
    form.set("citizen_phone", phoneDigits);
    form.set("service_category", serviceCategory);
    form.set("department", department);
    form.set("sub_department", subDepartment);
    form.set("issue_type", issueType);

    if (orgMultiSelect && organizations.length > 0) {
      form.set("organization", organizations.join(" | "));
    } else {
      form.set("organization", organization);
    }
    form.set("geographic_district", taxonomy?.auto_geographic_district ?? "");
    form.set("constituency", taxonomy?.auto_constituency ?? "");

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
      showSubmitError(termsNotAcceptedMessage(lang));
      return;
    }

    setSubmitting(true);

    if (orgMultiSelect && showOrganization && organizations.length === 0) {
      showSubmitError(orgRequiredMessage(lang));
      setSubmitting(false);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      showSubmitError(invalidPhoneMessage(lang));
      setSubmitting(false);
      return;
    }

    const required: { key: string; label: string; value: string }[] = [
      { key: "citizen_name", label: "Name", value: readFormValue("citizen_name") },
      { key: "citizen_pincode", label: "Pincode", value: readFormValue("citizen_pincode") },
      { key: "service_category", label: "Category", value: serviceCategory },
      { key: "department", label: "Department", value: department },
      { key: "title", label: "Title", value: readFormValue("title") },
      { key: "grievance_text", label: "Grievance details", value: readFormValue("grievance_text") },
      { key: "area", label: "Area", value: readFormValue("area") },
    ];
    const missing = required.filter((item) => !item.value);
    if (missing.length > 0) {
      showSubmitError(missingFieldsMessage(lang, missing.map((m) => m.label)));
      setSubmitting(false);
      return;
    }

    const form = buildSubmitFormData();

    try {
      const res = await registerForHearing(hearing.id, form);
      setRegistrationResult(res.data);
      setAcceptedTerms(false);
      setSubmitError(null);
      event.currentTarget.reset();
      setActiveStep(0);
      setServiceCategory("");
      setDepartment("");
      setSubDepartment("");
      setOrganization("");
      setOrganizations([]);
      setOrganizationSearch("");
      setIssueType("");
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
      const validationError = validateUploadFile(file);
      if (validationError) {
        errors.push(validationError);
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) {
      setFileUploadError(errors[0] ?? "Could not add the selected file(s).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFiles((prev) => {
      const merged = [...prev];
      for (const file of accepted) {
        if (merged.length >= 3) {
          errors.push("You can attach at most 3 files.");
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
      pincode: field("citizen_pincode"),
      email: field("citizen_email"),
      language:
        LANGUAGES.find((l) => l.value === (field("preferred_language") || "or"))?.label ?? "",
      category: serviceCategory,
      department,
      subDepartment,
      organization: orgMultiSelect ? organizations.join(", ") : organization,
      issueType,
      district: taxonomy?.auto_geographic_district ?? "",
      constituency: taxonomy?.auto_constituency ?? "",
      title: field("title"),
      area: field("area"),
      grievanceText: field("grievance_text"),
      attachments: filePreviews,
    };
  }, [
    activeStep,
    serviceCategory,
    department,
    subDepartment,
    organization,
    organizations,
    issueType,
    filePreviews,
    orgMultiSelect,
    phoneDigits,
    taxonomy,
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <GovtNavbar homeHref="/" />

      {/* Hearing header - flat, no shadow */}
      <section className="border-b-2 border-saffron/20 bg-white">
        <div className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Link href="/" className="font-medium text-navy-700 hover:text-saffron hover:underline">
              Jana Samadhan
            </Link>
            <Icon name="chevron-right" size={14} className="text-slate-400" />
            <Link href="/hearing" className="font-medium text-navy-700 hover:text-saffron hover:underline">
              Online Grievance Hearing
            </Link>
            <Icon name="chevron-right" size={14} className="text-slate-400" />
            <span className="truncate text-slate-600">Register</span>
          </nav>

          <div className="mt-6 lg:flex lg:items-end lg:justify-between lg:gap-10">
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-saffron">
                Online Grievance Hearing Registration
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem] lg:leading-tight">
                {hearing.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
                Register your grievance for this hearing. Complete each step - personal details,
                department selection, grievance description, and optional documents - matching
                WhatsApp registration.
              </p>
              {hearing.description ? (
                <p className="mt-2 max-w-3xl text-sm text-slate-500">{hearing.description}</p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2 lg:mt-0 lg:max-w-md lg:flex-col lg:items-end">
              <MetaPill label="Hearing" value={formatWhen(hearing.hearing_date)} highlight />
              <MetaPill label="Closes" value={formatWhen(hearing.registration_closes_at)} />
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                  hearing.registration_open
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-600",
                )}
              >
                {hearing.registration_open ? "● Registration open" : "Registration closed"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Form body - full width, flat */}
      <main className="mx-auto w-full max-w-[1920px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {!hearing.registration_open ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-8 text-center">
            <p className="text-lg font-semibold text-amber-900">Registration is not open</p>
            <p className="mt-2 text-sm text-amber-800">
              This hearing is not accepting registrations right now. Please check back later.
            </p>
            <Link
              href="/hearing"
              className="mt-6 inline-flex rounded-lg bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-600"
            >
              View all hearings
            </Link>
          </div>
        ) : registrationResult ? (
          <RegistrationSuccessPanel result={registrationResult} hearing={hearing} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            {/* Step stepper - connected, flat */}
            <div className="border-b border-border bg-surface-muted px-4 py-5 sm:px-8">
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

            <form ref={formRef} onSubmit={onSubmit} className="relative flex flex-col">
              {submitting ? (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-[1px]"
                  aria-live="polite"
                  aria-busy
                >
                  <SectionLoader label="Submitting your registration…" />
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
              <div className="min-h-[400px] border-b border-border px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
                {/* Step 0 - Personal */}
                <StepPanel step={0} activeStep={activeStep} title="Your details" subtitle="Tell us how to reach you on WhatsApp for hearing updates.">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Full name" name="citizen_name" required />
                    <PhoneField digits={phoneDigits} onChange={setPhoneDigits} />
                    <input type="hidden" name="citizen_phone" value={phoneDigits} />
                    <Field label="Pincode" name="citizen_pincode" required placeholder="6 digits" />
                    <Field label="Email (optional)" name="citizen_email" type="email" />
                    <HearingSelectField
                      label="Preferred language"
                      name="preferred_language"
                      value={preferredLanguage}
                      onChange={setPreferredLanguage}
                      hint="Notifications will be sent in this language"
                      options={LANGUAGES.map((lang) => ({ value: lang.value, label: lang.label }))}
                    />
                  </div>
                </StepPanel>

                {/* Step 1 - Category */}
                <StepPanel step={1} activeStep={activeStep} title="Category - department" subtitle="Choose the same service category and department as WhatsApp grievance registration.">
                  <div className="grid gap-5 lg:grid-cols-2">
                    <HearingSelectField
                      label="Service category"
                      name="service_category"
                      required
                      value={serviceCategory}
                      onChange={setServiceCategory}
                      placeholder="Select category"
                      hint="Same categories as WhatsApp grievance registration"
                      options={SERVICE_CATEGORIES.map((c) => ({ value: c, label: c }))}
                    />

                    {taxonomyLoading ? (
                      <SectionLoader
                        label="Loading departments…"
                        className="lg:col-span-2"
                      />
                    ) : taxonomy ? (
                      <>
                        {taxonomy.is_district_picker ? (
                          <div className="rounded-lg border border-navy-700/15 bg-navy-700/5 px-4 py-3 text-sm text-slate-700 lg:col-span-2">
                            <span className="font-medium">District:</span>{" "}
                            {taxonomy.auto_geographic_district}
                            {taxonomy.auto_constituency ? (
                              <>
                                {" "}
                                · <span className="font-medium">Constituency:</span>{" "}
                                {taxonomy.auto_constituency}
                              </>
                            ) : null}
                          </div>
                        ) : null}

                        <HearingSelectField
                          label={deptLabel}
                          name="department"
                          required
                          value={department}
                          onChange={(next) => {
                            setDepartment(next);
                            setSubDepartment("");
                            setOrganization("");
                            setOrganizations([]);
                            setOrganizationSearch("");
                            setIssueType("");
                          }}
                          placeholder={`Select ${deptLabel.toLowerCase()}`}
                          options={taxonomy.departments.map((d) => ({ value: d.name, label: d.name }))}
                        />

                        {showSubDepartment ? (
                          <HearingSelectField
                            label="Sub-department"
                            name="sub_department"
                            required
                            value={subDepartment}
                            onChange={(next) => {
                              setSubDepartment(next);
                              setOrganization("");
                              setOrganizations([]);
                              setOrganizationSearch("");
                              setIssueType("");
                            }}
                            placeholder="Select sub-department"
                            options={(selectedDept?.sub_departments ?? []).map((s) => ({
                              value: s.name,
                              label: s.name,
                            }))}
                          />
                        ) : (
                          <input type="hidden" name="sub_department" value={subDepartment} />
                        )}

                        {showOrganization && orgMultiSelect ? (
                          <OrganizationMultiSelectField
                            organizations={selectedSub?.organizations ?? []}
                            selected={organizations}
                            search={organizationSearch}
                            onSearchChange={setOrganizationSearch}
                            onChange={setOrganizations}
                          />
                        ) : showOrganization ? (
                          <HearingSelectField
                            label="Organization"
                            name="organization"
                            value={organization}
                            onChange={setOrganization}
                            searchable
                            searchPlaceholder="Search organization..."
                            placeholder="Select organization (optional)"
                            options={[
                              { value: "", label: "Select organization (optional)" },
                              ...(selectedSub?.organizations ?? []).map((org) => ({
                                value: org.name,
                                label: org.name,
                              })),
                            ]}
                          />
                        ) : (
                          <input type="hidden" name="organization" value={organization} />
                        )}

                        {showIssueType ? (
                          <HearingSelectField
                            label="Issue type"
                            name="issue_type"
                            required
                            value={issueType}
                            onChange={setIssueType}
                            placeholder="Select issue type"
                            options={(selectedSub?.issue_types ?? []).map((t) => ({
                              value: t,
                              label: t,
                            }))}
                          />
                        ) : (
                          <input type="hidden" name="issue_type" value={issueType} />
                        )}
                      </>
                    ) : serviceCategory ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 lg:col-span-2">
                        <p className="text-sm text-red-800">
                          {taxonomyError ?? "Could not load department options. Please try again."}
                        </p>
                        <button
                          type="button"
                          onClick={() => setTaxonomyReloadKey((k) => k + 1)}
                          className="mt-2 text-sm font-semibold text-navy-700 underline hover:text-saffron"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 lg:col-span-2">
                        Select a service category to load departments.
                      </p>
                    )}
                  </div>
                </StepPanel>

                {/* Step 2 - Grievance */}
                <StepPanel step={2} activeStep={activeStep} title="Grievance details" subtitle="Describe your issue clearly so it can be reviewed before the hearing.">
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="lg:col-span-2">
                      <Field label="Grievance title" name="title" required placeholder="Short summary of your issue" />
                    </div>
                    <label className="block text-sm lg:col-span-2">
                      <span className="mb-1.5 block font-medium text-slate-700">
                        Grievance details
                      </span>
                      <textarea
                        name="grievance_text"
                        required
                        minLength={10}
                        rows={6}
                        placeholder="Describe your grievance in detail - include dates, locations, and what outcome you expect..."
                        className="hearing-form-input min-h-[9rem] resize-y"
                      />
                    </label>
                    <Field
                      label="Area / locality"
                      name="area"
                      required
                      placeholder="Village, ward, or landmark"
                    />
                  </div>
                </StepPanel>

                {/* Step 3 - Attachments */}
                <StepPanel step={3} activeStep={activeStep} title="Supporting documents" subtitle="Optional photos, videos, or PDFs to support your grievance (same limits as WhatsApp).">
                  <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                    <div>
                      <div className="rounded-lg border-2 border-dashed border-slate-300 bg-surface-muted px-6 py-10 text-center">
                        <p className="text-sm font-medium text-slate-700">
                          Upload up to 3 files
                          {files.length > 0 ? (
                            <span className="text-slate-500"> ({files.length}/3 added)</span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          JPG, PNG, PDF (max 5 MB) - MP4, 3GP (max 16 MB)
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Select multiple at once, or use Choose files again to add more (max 3).
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
                          {files.length >= 3 ? "Maximum 3 files" : "Choose files"}
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
                                Remove
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

                {/* Step 4 - Review */}
                <StepPanel step={4} activeStep={activeStep} title="Review - submit" subtitle="Please verify all details before submitting your hearing registration.">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ReviewBlock title="Personal details">
                      <ReviewRow label="Name" value={reviewSnapshot.name} />
                      <ReviewRow label="Phone" value={reviewSnapshot.phone} />
                      <ReviewRow label="Pincode" value={reviewSnapshot.pincode} />
                      <ReviewRow label="Email" value={reviewSnapshot.email} />
                      <ReviewRow label="Language" value={reviewSnapshot.language} />
                    </ReviewBlock>
                    <ReviewBlock title="Category - department">
                      <ReviewRow label="Category" value={reviewSnapshot.category} />
                      {reviewSnapshot.district ? (
                        <ReviewRow label="District" value={reviewSnapshot.district} />
                      ) : null}
                      {reviewSnapshot.constituency ? (
                        <ReviewRow label="Constituency" value={reviewSnapshot.constituency} />
                      ) : null}
                      <ReviewRow label="Department" value={reviewSnapshot.department} />
                      <ReviewRow label="Sub-department" value={reviewSnapshot.subDepartment} />
                      <ReviewRow label="Organization" value={reviewSnapshot.organization} />
                      <ReviewRow label="Issue type" value={reviewSnapshot.issueType} />
                    </ReviewBlock>
                    <ReviewBlock title="Grievance" className="lg:col-span-2">
                      <ReviewRow label="Title" value={reviewSnapshot.title} />
                      <ReviewRow label="Area / locality" value={reviewSnapshot.area} />
                      <div className="mt-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Details
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                          {reviewSnapshot.grievanceText || "-"}
                        </p>
                      </div>
                    </ReviewBlock>
                    <ReviewBlock title="Attachments" className="lg:col-span-2">
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
                        <p className="text-sm text-slate-500">No files attached.</p>
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
                          if (error?.includes("Terms & Conditions")) {
                            setError(null);
                          }
                        }
                      }}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-saffron"
                    />
                    <span className="text-xs leading-relaxed text-slate-700">
                      I confirm that the information provided is accurate and complete. I have read
                      and agree to the{" "}
                      <Link
                        href="/hearing/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-navy-700 underline hover:text-saffron"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms &amp; Conditions
                      </Link>{" "}
                      for Online Grievance Hearing registration. I understand that approved
                      registrations receive a serial number and WhatsApp notification with the
                      Google Meet link for the hearing.
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
              <div className="flex flex-col gap-3 bg-surface-muted px-4 py-4 sm:px-8 lg:px-12">
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
                    Previous
                  </span>
                </Button>

                <p className="hidden text-sm font-medium text-slate-500 sm:block">
                  Step {activeStep + 1} of {STEPS.length} - {STEPS[activeStep].label}
                </p>

                {isLastStep ? (
                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={!acceptedTerms || submitting}
                    className="min-w-[140px]"
                  >
                    Submit registration
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={goNext}
                    disabled={submitting}
                    className="min-w-[120px]"
                  >
                    <span className="inline-flex items-center gap-2">
                      Next
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

function validateUploadFile(file: File): string | null {
  const kind = detectFileKind(file);
  if (kind === "other") {
    return `${file.name} is not supported. Use JPG, PNG, PDF, MP4, or 3GP.`;
  }
  const maxBytes = kind === "video" ? 16 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return `${file.name} is too large (max ${kind === "video" ? "16" : "5"} MB).`;
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

function OrganizationMultiSelectField({
  organizations,
  selected,
  search,
  onSearchChange,
  onChange,
}: {
  organizations: { name: string }[];
  selected: string[];
  search: string;
  onSearchChange: (value: string) => void;
  onChange: (values: string[]) => void;
}) {
  const query = search.trim().toLowerCase();
  const filtered = query
    ? organizations.filter((org) => org.name.toLowerCase().includes(query))
    : organizations;

  return (
    <fieldset className="text-sm lg:col-span-2">
      <legend className="mb-2 block text-sm text-slate-800">
        <span className="font-semibold">Organization</span>
        <span className="font-normal text-slate-500"> (select one or more)</span>
      </legend>
      <div className="rounded-lg border border-border bg-surface-muted p-3">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search organization..."
          className="hearing-form-input"
          aria-label="Search organizations"
        />
        <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length > 0 ? (
            filtered.map((org) => (
              <label
                key={org.name}
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2.5 transition-colors",
                  selected.includes(org.name)
                    ? "border-saffron bg-saffron/5"
                    : "border-border bg-white hover:border-navy-700/30",
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(org.name)}
                  onChange={(e) => {
                    onChange(
                      e.target.checked
                        ? [...selected, org.name]
                        : selected.filter((n) => n !== org.name),
                    );
                  }}
                  className="mt-0.5 accent-saffron"
                />
                <span className="text-sm">{org.name}</span>
              </label>
            ))
          ) : (
            <p className="col-span-full py-4 text-center text-sm text-slate-500">
              No organizations match your search.
            </p>
          )}
        </div>
        {selected.length > 0 ? (
          <p className="mt-2 text-xs text-slate-500">{selected.length} selected</p>
        ) : null}
      </div>
      <input type="hidden" name="organization" value={selected.join(" | ")} />
    </fieldset>
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
  if (previews.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted px-6 py-8 text-center lg:min-h-[280px]">
        <p className="text-sm font-medium text-slate-600">Photo / video preview</p>
        <p className="mt-1 text-xs text-slate-500">
          Uploaded images and videos will appear here. Click to view full size.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
        Preview ({previews.length})
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
                    Play video
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
      <p className="mt-3 text-xs text-slate-500">Click a preview to open full size.</p>
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
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${preview.name}`}
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
            Close
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
}: {
  result: HearingRegisterResult;
  hearing: HearingPublicSummary;
}) {
  const hearingWhen = formatWhen(hearing.hearing_date);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-emerald-200 bg-white">
      <div className="border-b border-emerald-100 bg-emerald-50/50 px-4 py-10 text-center sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500 text-xl font-bold text-emerald-700">
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">Thank you for registering</h2>
        <p className="mx-auto mt-2 max-w-4xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Your grievance has been submitted for the Online Grievance Hearing. Please save the
          reference number below for future tracking.
        </p>

        <div className="mx-auto mt-8 max-w-4xl rounded-lg border-2 border-saffron/40 bg-saffron/5 px-5 py-6 lg:max-w-none">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">
            Your grievance reference ID
          </p>
          <p className="mt-2 break-all font-mono text-2xl font-bold tracking-wide text-navy-900 sm:text-3xl lg:text-4xl">
            {result.reference_number}
          </p>
          <p className="mt-2 text-xs text-slate-600 sm:text-sm">
            Screenshot or note this number. You will need it for any follow-up.
          </p>
        </div>
      </div>

      <div className="grid gap-6 px-4 py-8 sm:px-8 lg:grid-cols-2 lg:gap-8 lg:px-12 lg:py-10">
        <SuccessInfoBlock title="What is this reference ID?">
          <p>
            This is your unique grievance ID in the Jana Samadhan portal. It is created when your
            registration is saved and stays the same for this grievance through screening, hearing,
            and department follow-up.
          </p>
        </SuccessInfoBlock>

        <SuccessInfoBlock title="How it helps you track your grievance">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Quote this ID when you contact the helpline or Minister&apos;s Office.</li>
            <li>Use it to identify your case in WhatsApp messages from the portal.</li>
            <li>Keep it safe so you can check status or share details if asked again.</li>
          </ul>
        </SuccessInfoBlock>

        <SuccessInfoBlock title="What happens next" className="lg:col-span-2">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="rounded-lg border border-border bg-surface-muted p-4">
              <span className="font-medium text-slate-900">Confirmation on WhatsApp</span>
              <span className="mt-1 block text-sm text-slate-600">
                A confirmation message with your reference ID and hearing date ({hearingWhen}) is
                sent to your registered WhatsApp number in your preferred language.
              </span>
            </li>
            <li className="rounded-lg border border-border bg-surface-muted p-4">
              <span className="font-medium text-slate-900">Review by Minister&apos;s Office</span>
              <span className="mt-1 block text-sm text-slate-600">
                PS / OSD officials screen all registrations for this hearing. Not every grievance
                may be shortlisted for the live hearing.
              </span>
            </li>
            <li className="rounded-lg border border-border bg-surface-muted p-4">
              <span className="font-medium text-slate-900">If you are selected</span>
              <span className="mt-1 block text-sm text-slate-600">
                You will receive a WhatsApp message with your serial number, hearing date and time,
                and the Google Meet link. Please join about 15 minutes before your turn.
              </span>
            </li>
            <li className="rounded-lg border border-border bg-surface-muted p-4">
              <span className="font-medium text-slate-900">If you are not selected</span>
              <span className="mt-1 block text-sm text-slate-600">
                Your grievance remains registered in the system. You may be informed through WhatsApp
                if it is not shortlisted for this hearing session.
              </span>
            </li>
          </ol>
        </SuccessInfoBlock>

        <SuccessInfoBlock title="How your grievance will be resolved" className="lg:col-span-2">
          <ul className="grid gap-3 sm:grid-cols-3">
            <li className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
              During the Online Grievance Hearing, the Hon&apos;ble Minister hears approved cases in
              serial order on Google Meet.
            </li>
            <li className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
              Remarks and directions are recorded and routed to the concerned department for action.
            </li>
            <li className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
              Further updates on progress may be shared with you on WhatsApp as the case moves
              forward.
            </li>
          </ul>
        </SuccessInfoBlock>
      </div>

      <p className="mx-4 mb-8 rounded-lg border border-border bg-surface-muted px-4 py-3 text-center text-xs leading-relaxed text-slate-600 sm:mx-8 lg:mx-12">
        All notifications are sent to the WhatsApp mobile number you provided. No further action is
        required right now unless you receive a message asking for more information.
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
    <section className={cn("text-sm leading-relaxed text-slate-700", className)}>
      <h3 className="text-sm font-bold text-navy-800">{title}</h3>
      <div className="mt-2">{children}</div>
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
        "inline-flex min-w-[10rem] flex-col rounded-lg border px-3 py-2 sm:min-w-[12rem]",
        highlight
          ? "border-saffron/40 bg-saffron/5"
          : "border-border bg-white",
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="mt-0.5 text-sm font-semibold text-slate-900">{value}</span>
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
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const isActive = step === activeStep;
  return (
    <div
      data-step-panel={step}
      className={cn(!isActive && "hidden")}
      aria-hidden={!isActive || undefined}
    >
      {isActive ? (
        <div className="mb-8 border-l-4 border-saffron pl-4">
          <h2 className="text-xl text-slate-900 sm:text-2xl">
            <span className="font-bold">{title}</span>
            <span className="font-normal text-slate-500">
              {" "}
              (step {step + 1} of {STEPS.length})
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
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
    <div className="flex flex-wrap gap-x-2 text-sm">
      <span className="font-medium text-slate-500">{label}:</span>
      <span className="text-slate-900">{display}</span>
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
                  Play video
                </span>
              </div>
            </button>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center bg-surface-muted px-4 text-center">
              <span className="text-2xl">{item.kind === "pdf" ? "PDF" : "FILE"}</span>
              <span className="mt-2 text-xs text-slate-600">{item.kind === "pdf" ? "Document" : "Attachment"}</span>
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
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-800">
        WhatsApp mobile number
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
          aria-label="10-digit mobile number"
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
    <label className="block">
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
