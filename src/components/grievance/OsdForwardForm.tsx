"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { forwardOsdGrievance } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { buildForwardCitizenMessage } from "@/lib/grievance/statusMessageTemplates";
import { useI18n } from "@/lib/i18n/context";
import type { OsdDepartmentContact } from "@/types/api";

type RecipientRow = {
  key: string;
  mode: "department" | "manual";
  departmentIndex: number;
  department: string;
  officer_name: string;
  email: string;
  whatsapp_number: string;
};

type OsdForwardFormProps = {
  osdSlug: string;
  referenceNumber: string;
  citizenName?: string;
  suggestedRecipients: OsdDepartmentContact[];
  resolvedRecipients: OsdDepartmentContact[];
  grievanceDepartment?: string;
  grievanceSubDepartment?: string;
  grievanceOrganization?: string;
  grievanceOsdCategory?: string;
};

function newRowKey() {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function isOsdCategoryPlaceholder(dept: string, osdCategory: string): boolean {
  const normalizedDept = dept.trim().toLowerCase();
  const normalizedCategory = osdCategory.trim().toLowerCase();
  return Boolean(normalizedDept && normalizedCategory && normalizedDept === normalizedCategory);
}

function effectiveTaxonomyDepartment(dept: string, osdCategory: string): string {
  return isOsdCategoryPlaceholder(dept, osdCategory) ? "" : dept.trim();
}

function buildTaxonomyLabel(
  dept: string,
  sub: string,
  org: string,
  osdCategory: string,
): string {
  const parts: string[] = [];
  const effectiveDept = effectiveTaxonomyDepartment(dept, osdCategory);
  if (effectiveDept) parts.push(effectiveDept);
  if (sub.trim()) parts.push(sub.trim());
  if (org.trim()) parts.push(org.trim());
  return parts.join(" / ");
}

function mergeRecipientOptions(
  resolvedRecipients: OsdDepartmentContact[],
  suggestedRecipients: OsdDepartmentContact[],
): OsdDepartmentContact[] {
  const seen = new Set<string>();
  const merged: OsdDepartmentContact[] = [];
  for (const contact of [...resolvedRecipients, ...suggestedRecipients]) {
    const key = `${contact.department.trim().toLowerCase()}|${(contact.email ?? "").trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(contact);
  }
  return merged;
}

function findSuggestedIndex(
  recipientOptions: OsdDepartmentContact[],
  department: string,
  subDepartment = "",
): number {
  if (recipientOptions.length === 0) return -1;

  const deptLower = department.trim().toLowerCase();
  const subLower = subDepartment.trim().toLowerCase();

  if (deptLower) {
    const exact = recipientOptions.findIndex(
      (contact) => contact.department.trim().toLowerCase() === deptLower,
    );
    if (exact >= 0) return exact;

    if (subLower) {
      const withSub = recipientOptions.findIndex(
        (contact) =>
          contact.department.trim().toLowerCase() === deptLower &&
          (contact.sub_department ?? "").trim().toLowerCase() === subLower,
      );
      if (withSub >= 0) return withSub;
    }

    const partial = recipientOptions.findIndex((contact) => {
      const label = contact.department.trim().toLowerCase();
      return label.includes(deptLower) || deptLower.includes(label);
    });
    if (partial >= 0) return partial;
  }

  if (subLower) {
    const subMatch = recipientOptions.findIndex(
      (contact) => (contact.sub_department ?? "").trim().toLowerCase() === subLower,
    );
    if (subMatch >= 0) return subMatch;
  }

  return -1;
}

function rowFromContact(
  contact: OsdDepartmentContact,
  recipientOptions: OsdDepartmentContact[],
  autoFill: boolean,
): RecipientRow {
  const primaryDepartment = contact.department.split(" / ")[0]?.trim() ?? contact.department;
  const index = findSuggestedIndex(
    recipientOptions,
    primaryDepartment,
    contact.sub_department ?? "",
  );
  const matched = index >= 0 ? recipientOptions[index] : null;
  const contactEmail = (contact.email ?? "").trim().toLowerCase();
  const hasDropdownMatch =
    matched !== null &&
    (matched.department.trim().toLowerCase() === primaryDepartment.toLowerCase() ||
      matched.department.trim().toLowerCase() === contact.department.trim().toLowerCase() ||
      (contactEmail.length > 0 && matched.email.trim().toLowerCase() === contactEmail));

  return {
    key: newRowKey(),
    mode: hasDropdownMatch ? "department" : "manual",
    departmentIndex: hasDropdownMatch ? index : -1,
    department: contact.department,
    officer_name: autoFill ? (contact.officer_name ?? "") : "",
    email: autoFill ? (contact.email ?? "") : "",
    whatsapp_number: autoFill ? (contact.whatsapp_number ?? "") : "",
  };
}

function buildInitialRows(
  autoFillEnabled: boolean,
  recipientOptions: OsdDepartmentContact[],
  resolvedRecipients: OsdDepartmentContact[],
  grievanceDepartment: string,
  grievanceSubDepartment: string,
  grievanceOrganization: string,
  grievanceOsdCategory: string,
): RecipientRow[] {
  if (autoFillEnabled && resolvedRecipients.length > 0) {
    return resolvedRecipients.map((contact) =>
      rowFromContact(contact, recipientOptions, true),
    );
  }

  const effectiveDept = effectiveTaxonomyDepartment(grievanceDepartment, grievanceOsdCategory);
  const index = findSuggestedIndex(recipientOptions, effectiveDept, grievanceSubDepartment);

  if (index >= 0) {
    const contact = recipientOptions[index];
    return [
      {
        key: newRowKey(),
        mode: "department",
        departmentIndex: index,
        department: contact.department,
        officer_name: autoFillEnabled ? (contact.officer_name ?? "") : "",
        email: autoFillEnabled ? (contact.email ?? "") : "",
        whatsapp_number: autoFillEnabled ? (contact.whatsapp_number ?? "") : "",
      },
    ];
  }

  return [
    {
      key: newRowKey(),
      mode: "manual",
      departmentIndex: -1,
      department: buildTaxonomyLabel(
        grievanceDepartment,
        grievanceSubDepartment,
        grievanceOrganization,
        grievanceOsdCategory,
      ),
      officer_name: "",
      email: "",
      whatsapp_number: "",
    },
  ];
}

function newDepartmentRow(
  recipientOptions: OsdDepartmentContact[],
  index = 0,
  autoFill = true,
): RecipientRow {
  const contact = recipientOptions[index];
  return {
    key: newRowKey(),
    mode: index >= 0 ? "department" : "manual",
    departmentIndex: index,
    department: contact?.department ?? "",
    officer_name: autoFill ? (contact?.officer_name ?? "") : "",
    email: autoFill ? (contact?.email ?? "") : "",
    whatsapp_number: autoFill ? (contact?.whatsapp_number ?? "") : "",
  };
}

function newManualRow(): RecipientRow {
  return {
    key: newRowKey(),
    mode: "manual",
    departmentIndex: -1,
    department: "",
    officer_name: "",
    email: "",
    whatsapp_number: "",
  };
}

export function OsdForwardForm({
  osdSlug,
  referenceNumber,
  citizenName = "",
  suggestedRecipients,
  resolvedRecipients,
  grievanceDepartment = "",
  grievanceSubDepartment = "",
  grievanceOrganization = "",
  grievanceOsdCategory = "",
}: OsdForwardFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [remarks, setRemarks] = useState("");
  const [citizenMessage, setCitizenMessage] = useState("");
  const [messageTouched, setMessageTouched] = useState(false);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "warning">("success");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);

  const recipientOptions = useMemo(
    () => mergeRecipientOptions(resolvedRecipients, suggestedRecipients),
    [resolvedRecipients, suggestedRecipients],
  );

  const initialRows = useMemo(
    () =>
      buildInitialRows(
        true,
        recipientOptions,
        resolvedRecipients,
        grievanceDepartment,
        grievanceSubDepartment,
        grievanceOrganization,
        grievanceOsdCategory,
      ),
    [
      recipientOptions,
      resolvedRecipients,
      grievanceDepartment,
      grievanceSubDepartment,
      grievanceOrganization,
      grievanceOsdCategory,
    ],
  );

  const [rows, setRows] = useState<RecipientRow[]>(initialRows);

  const primaryDepartmentName = useMemo(() => {
    const first = rows.find((row) => row.department.trim());
    return first?.department.trim() ?? "";
  }, [rows]);

  useEffect(() => {
    if (messageTouched) return;
    setCitizenMessage(
      buildForwardCitizenMessage({
        citizenName,
        referenceNumber,
        departmentName: primaryDepartmentName,
        remarks,
      }),
    );
  }, [citizenName, referenceNumber, primaryDepartmentName, remarks, messageTouched]);

  function updateRow(key: string, patch: Partial<RecipientRow>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  const applyAutoFillToRows = useCallback(
    () =>
      buildInitialRows(
        true,
        recipientOptions,
        resolvedRecipients,
        grievanceDepartment,
        grievanceSubDepartment,
        grievanceOrganization,
        grievanceOsdCategory,
      ),
    [
      grievanceDepartment,
      grievanceOrganization,
      grievanceOsdCategory,
      grievanceSubDepartment,
      recipientOptions,
      resolvedRecipients,
    ],
  );

  function onAutoFillToggle(enabled: boolean) {
    setAutoFillEnabled(enabled);
    if (enabled) {
      setRows(applyAutoFillToRows());
    }
  }

  function onDepartmentSelect(key: string, index: number) {
    const contact = recipientOptions[index];
    if (!contact) return;
    updateRow(key, {
      mode: "department",
      departmentIndex: index,
      department: contact.department,
      ...(autoFillEnabled
        ? {
            officer_name: contact.officer_name,
            email: contact.email,
            whatsapp_number: contact.whatsapp_number,
          }
        : {}),
    });
  }

  function addDepartmentRecipient() {
    const defaultIndex = recipientOptions.length > 0 ? 0 : -1;
    setRows((current) => [
      ...current,
      newDepartmentRow(recipientOptions, defaultIndex, autoFillEnabled),
    ]);
  }

  function addManualRecipient() {
    setRows((current) => [...current, newManualRow()]);
  }

  function removeRow(key: string) {
    setRows((current) => (current.length === 1 ? current : current.filter((row) => row.key !== key)));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const recipients = rows
      .map((row) => ({
        department: row.department.trim(),
        officer_name: row.officer_name.trim(),
        email: row.email.trim(),
        whatsapp_number: row.whatsapp_number.trim(),
      }))
      .filter((row) => row.email);

    if (recipients.length === 0) {
      setError(t("dashboard", "forwardForm.recipientRequired"));
      return;
    }

    setLoading(true);
    try {
      const result = await forwardOsdGrievance(osdSlug, referenceNumber, {
        remarks,
        citizen_message: citizenMessage.trim(),
        recipients,
        cc: cc
          .split(/[,;]/)
          .map((item) => item.trim())
          .filter(Boolean),
        bcc: bcc
          .split(/[,;]/)
          .map((item) => item.trim())
          .filter(Boolean),
      });
      router.refresh();
      const warning = result.data?.whatsapp_warning;
      if (warning) {
        setMessageTone("warning");
        setMessage(warning);
      } else {
        setMessageTone("success");
        setMessage(result.message || t("dashboard", "forwardForm.success"));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title={t("dashboard", "grievance.forward")}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-slate-50/80 px-4 py-3">
          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                checked={autoFillEnabled}
                onChange={(e) => onAutoFillToggle(e.target.checked)}
              />
              {t("dashboard", "forwardForm.autoFillToggle")}
            </label>
            <p className="mt-1 text-xs text-text-muted">
              {t("dashboard", "forwardForm.autoFillHint")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={row.key} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {t("dashboard", "forwardForm.recipient")} {index + 1}
                </p>
                {rows.length > 1 ? (
                  <Button type="button" size="sm" variant="outline" onClick={() => removeRow(row.key)}>
                    {t("dashboard", "forwardForm.removeRecipient")}
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                {row.mode === "department" && row.departmentIndex >= 0 && recipientOptions.length > 0 ? (
                  <Select
                    label={t("dashboard", "departments.department")}
                    value={String(row.departmentIndex)}
                    onChange={(e) => onDepartmentSelect(row.key, Number(e.target.value))}
                    options={recipientOptions.map((contact, deptIndex) => ({
                      value: String(deptIndex),
                      label: contact.department,
                    }))}
                  />
                ) : (
                  <Input
                    label={t("dashboard", "departments.department")}
                    value={row.department}
                    onChange={(e) => updateRow(row.key, { department: e.target.value, mode: "manual", departmentIndex: -1 })}
                    placeholder={t("dashboard", "forwardForm.manualDepartmentHint")}
                  />
                )}

                <Input
                  label={t("dashboard", "departments.officerName")}
                  value={row.officer_name}
                  onChange={(e) => updateRow(row.key, { officer_name: e.target.value, mode: "manual", departmentIndex: -1 })}
                />

                <Input
                  label={t("dashboard", "departments.email")}
                  type="email"
                  value={row.email}
                  onChange={(e) => updateRow(row.key, { email: e.target.value, mode: "manual", departmentIndex: -1 })}
                  required
                />
                <Input
                  label={t("dashboard", "departments.whatsappNumber")}
                  value={row.whatsapp_number}
                  onChange={(e) =>
                    updateRow(row.key, { whatsapp_number: e.target.value, mode: "manual", departmentIndex: -1 })
                  }
                  placeholder="+91XXXXXXXXXX"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={addDepartmentRecipient}>
            {t("dashboard", "forwardForm.addDepartmentRecipient")}
          </Button>
          <Button type="button" variant="outline" onClick={addManualRecipient}>
            {t("dashboard", "forwardForm.addManualRecipient")}
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label={t("dashboard", "forwardForm.cc")}
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="email1@gov.in, email2@gov.in"
          />
          <Input
            label={t("dashboard", "forwardForm.bcc")}
            value={bcc}
            onChange={(e) => setBcc(e.target.value)}
            placeholder="email1@gov.in, email2@gov.in"
          />
        </div>

        <div className="space-y-1.5">
          <Textarea
            label={t("dashboard", "grievance.remarksForDepartment")}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <p className="text-xs text-text-muted">
            {t("dashboard", "grievance.remarksForDepartmentHint")}
          </p>
        </div>

        <div className="space-y-1.5">
          <Textarea
            label={t("dashboard", "grievance.citizenMessage")}
            value={citizenMessage}
            onChange={(e) => {
              setMessageTouched(true);
              setCitizenMessage(e.target.value);
            }}
            rows={8}
          />
          <p className="text-xs text-text-muted">
            {t("dashboard", "grievance.citizenMessageHint")}
          </p>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? (
          <p className={`text-sm ${messageTone === "success" ? "text-success" : "text-amber-700"}`}>
            {message}
          </p>
        ) : null}

        <Button type="submit" loading={loading} disabled={loading}>
          {t("dashboard", "grievance.forward")}
        </Button>
      </form>
    </Card>
  );
}
