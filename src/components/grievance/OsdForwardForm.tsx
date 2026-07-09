"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { forwardOsdGrievance } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
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
  suggestedRecipients: OsdDepartmentContact[];
};

function newDepartmentRow(
  suggestedRecipients: OsdDepartmentContact[],
  index = 0,
): RecipientRow {
  const contact = suggestedRecipients[index];
  return {
    key: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mode: "department",
    departmentIndex: index,
    department: contact?.department ?? "",
    officer_name: contact?.officer_name ?? "",
    email: contact?.email ?? "",
    whatsapp_number: contact?.whatsapp_number ?? "",
  };
}

function newManualRow(): RecipientRow {
  return {
    key: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mode: "manual",
    departmentIndex: 0,
    department: "",
    officer_name: "",
    email: "",
    whatsapp_number: "",
  };
}

export function OsdForwardForm({
  osdSlug,
  referenceNumber,
  suggestedRecipients,
}: OsdForwardFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [remarks, setRemarks] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const initialRow = useMemo(
    () =>
      suggestedRecipients.length > 0
        ? newDepartmentRow(suggestedRecipients, 0)
        : newManualRow(),
    [suggestedRecipients],
  );

  const [rows, setRows] = useState<RecipientRow[]>([initialRow]);

  function updateRow(key: string, patch: Partial<RecipientRow>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function onDepartmentSelect(key: string, index: number) {
    const contact = suggestedRecipients[index];
    if (!contact) return;
    updateRow(key, {
      mode: "department",
      departmentIndex: index,
      department: contact.department,
      officer_name: contact.officer_name,
      email: contact.email,
      whatsapp_number: contact.whatsapp_number,
    });
  }

  function addDepartmentRecipient() {
    setRows((current) => [...current, newDepartmentRow(suggestedRecipients)]);
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

    try {
      await forwardOsdGrievance(osdSlug, referenceNumber, {
        remarks,
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
      setMessage(t("dashboard", "forwardForm.success"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  return (
    <Card title={t("dashboard", "grievance.forward")}>
      <form onSubmit={onSubmit} className="space-y-4">
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
                {row.mode === "department" && suggestedRecipients.length > 0 ? (
                  <Select
                    label={t("dashboard", "departments.department")}
                    value={String(row.departmentIndex)}
                    onChange={(e) => onDepartmentSelect(row.key, Number(e.target.value))}
                    options={suggestedRecipients.map((contact, deptIndex) => ({
                      value: String(deptIndex),
                      label: contact.department,
                    }))}
                  />
                ) : (
                  <Input
                    label={t("dashboard", "departments.department")}
                    value={row.department}
                    onChange={(e) => updateRow(row.key, { department: e.target.value, mode: "manual" })}
                    placeholder={t("dashboard", "forwardForm.manualDepartmentHint")}
                  />
                )}

                <Input
                  label={t("dashboard", "departments.officerName")}
                  value={row.officer_name}
                  onChange={(e) => updateRow(row.key, { officer_name: e.target.value, mode: "manual" })}
                />

                <Input
                  label={t("dashboard", "departments.email")}
                  type="email"
                  value={row.email}
                  onChange={(e) => updateRow(row.key, { email: e.target.value, mode: "manual" })}
                  required
                />
                <Input
                  label={t("dashboard", "departments.whatsappNumber")}
                  value={row.whatsapp_number}
                  onChange={(e) =>
                    updateRow(row.key, { whatsapp_number: e.target.value, mode: "manual" })
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

        <Textarea
          label={t("dashboard", "grievance.remarks")}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}

        <Button type="submit">{t("dashboard", "grievance.forward")}</Button>
      </form>
    </Card>
  );
}
