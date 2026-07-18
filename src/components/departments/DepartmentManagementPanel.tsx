"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { SectionLoader } from "@/components/ui/Spinner";
import {
  bulkOsdDepartments,
  bulkPsTaxonomy,
  createOsdDepartment,
  createPsTaxonomy,
  fetchOsdDepartments,
  fetchPsTaxonomy,
  updateOsdDepartment,
  updatePsTaxonomy,
} from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import type { OsdDepartmentContactRecord } from "@/types/api";

const PS_CATEGORIES = [
  "Commerce & Transport",
  "Steel & Mines",
  "Ganjam District",
  "Gopalpur Constituency",
];

type DepartmentManagementPanelProps = {
  osdSlug?: string;
  psMode?: boolean;
};

export function DepartmentManagementPanel({ osdSlug, psMode = false }: DepartmentManagementPanelProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<OsdDepartmentContactRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [bulkMessage, setBulkMessage] = useState("");
  const [category, setCategory] = useState(PS_CATEGORIES[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [csvText, setCsvText] = useState("");
  const [form, setForm] = useState({
    department: "",
    sub_department: "",
    officer_name: "",
    email: "",
    whatsapp_number: "",
    is_other: false,
  });

  async function load() {
    if (psMode) {
      const res = await fetchPsTaxonomy(category);
      setItems(res.data.items);
      return;
    }
    if (!osdSlug) return;
    const res = await fetchOsdDepartments(osdSlug);
    setItems(res.data.items);
  }

  useEffect(() => {
    setLoading(true);
    load()
      .catch(() => setError(t("common", "errors.generic")))
      .finally(() => setLoading(false));
  }, [osdSlug, psMode, category]);

  function resetForm() {
    setEditingId(null);
    setForm({
      department: "",
      sub_department: "",
      officer_name: "",
      email: "",
      whatsapp_number: "",
      is_other: false,
    });
  }

  function startEdit(contact: OsdDepartmentContactRecord) {
    setEditingId(contact.id);
    setForm({
      department: contact.department,
      sub_department: contact.sub_department ?? "",
      officer_name: contact.officer_name,
      email: contact.email,
      whatsapp_number: contact.whatsapp_number,
      is_other: contact.is_other ?? false,
    });
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (psMode) {
        if (editingId) {
          await updatePsTaxonomy(category, editingId, form);
        } else {
          await createPsTaxonomy(category, form);
        }
      } else if (osdSlug) {
        if (editingId) {
          await updateOsdDepartment(osdSlug, editingId, form);
        } else {
          await createOsdDepartment(osdSlug, form);
        }
      }
      await load();
      resetForm();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  async function toggleActive(contact: OsdDepartmentContactRecord) {
    setError("");
    try {
      if (psMode) {
        await updatePsTaxonomy(category, contact.id, { is_active: !contact.is_active });
      } else if (osdSlug) {
        await updateOsdDepartment(osdSlug, contact.id, { is_active: !contact.is_active });
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  async function onBulkUpload(e: FormEvent) {
    e.preventDefault();
    setBulkMessage("");
    setError("");
    try {
      const result = psMode
        ? await bulkPsTaxonomy(csvText, category)
        : osdSlug
          ? await bulkOsdDepartments(osdSlug, csvText)
          : null;
      if (!result) return;
      setBulkMessage(
        t("dashboard", "departments.bulkResult", {
          created: String(result.data.created),
          updated: String(result.data.updated),
          skipped: String(result.data.skipped),
        }),
      );
      setCsvText("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  return (
    <div className="space-y-5">
      {psMode ? (
        <Card title={t("dashboard", "departments.category")}>
          <select
            className="w-full max-w-md rounded-md border border-border bg-surface px-3 py-2 text-sm"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              resetForm();
            }}
          >
            {PS_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Card>
      ) : null}

      <Card title={editingId ? t("dashboard", "departments.update") : t("dashboard", "departments.create")}>
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3">
          <Input
            label={t("dashboard", "departments.department")}
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
          />
          <Input
            label={t("dashboard", "departments.subDepartment")}
            value={form.sub_department}
            onChange={(e) => setForm({ ...form, sub_department: e.target.value })}
          />
          <Input
            label={t("dashboard", "departments.officerName")}
            value={form.officer_name}
            onChange={(e) => setForm({ ...form, officer_name: e.target.value })}
            required
          />
          <Input
            label={t("dashboard", "departments.email")}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label={t("dashboard", "departments.whatsappNumber")}
            value={form.whatsapp_number}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
            placeholder="+91XXXXXXXXXX"
          />
          <label className="flex items-center gap-2 text-sm md:col-span-3">
            <input
              type="checkbox"
              checked={form.is_other}
              onChange={(e) => setForm({ ...form, is_other: e.target.checked })}
            />
            {t("dashboard", "departments.isOther")}
          </label>
          {error ? <p className="text-sm text-danger md:col-span-3">{error}</p> : null}
          <div className="flex flex-wrap gap-2 md:col-span-3">
            <Button type="submit">
              {editingId ? t("dashboard", "departments.update") : t("dashboard", "departments.save")}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card title={t("dashboard", "departments.bulkTitle")}>
        <form onSubmit={onBulkUpload} className="space-y-3">
          <p className="text-sm text-text-muted">{t("dashboard", "departments.bulkHint")}</p>
          <textarea
            className="min-h-32 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="department,sub_department,officer_name,email,whatsapp_number,is_other"
          />
          {bulkMessage ? <p className="text-sm text-success">{bulkMessage}</p> : null}
          <Button type="submit" variant="outline">
            {t("dashboard", "departments.bulkUpload")}
          </Button>
        </form>
      </Card>

      <Card title={t("dashboard", "departments.title")}>
        {loading ? (
          <SectionLoader label={t("common", "actions.loading")} />
        ) : items.length === 0 ? (
          <p className="text-sm text-text-muted">{t("dashboard", "departments.empty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((contact) => (
              <li key={contact.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold">
                    {contact.department}
                    {contact.sub_department ? ` / ${contact.sub_department}` : ""}
                  </p>
                  {psMode ? (
                    <p className="text-text-muted">{contact.osd_category}</p>
                  ) : null}
                  <p className="text-text-muted">
                    {contact.officer_name || "—"} · {contact.email || "—"}
                  </p>
                  <p className="text-text-muted">
                    WhatsApp: {contact.whatsapp_number || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {contact.is_other ? <Badge tone="warning">Other</Badge> : null}
                  <Badge tone={contact.is_active ? "success" : "danger"}>
                    {contact.is_active
                      ? t("dashboard", "departments.active")
                      : t("dashboard", "departments.inactive")}
                  </Badge>
                  <Button type="button" size="sm" variant="outline" onClick={() => startEdit(contact)}>
                    {t("dashboard", "departments.update")}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => toggleActive(contact)}>
                    {contact.is_active
                      ? t("dashboard", "departments.deactivate")
                      : t("dashboard", "departments.activate")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
