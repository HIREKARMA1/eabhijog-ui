"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  createOsdDepartment,
  fetchOsdDepartments,
  updateOsdDepartment,
} from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import type { OsdDepartmentContactRecord } from "@/types/api";

type DepartmentManagementPanelProps = {
  osdSlug: string;
};

export function DepartmentManagementPanel({ osdSlug }: DepartmentManagementPanelProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<OsdDepartmentContactRecord[]>([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    department: "",
    officer_name: "",
    email: "",
  });

  async function load() {
    const res = await fetchOsdDepartments(osdSlug);
    setItems(res.data.items);
  }

  useEffect(() => {
    load().catch(() => setError(t("common", "errors.generic")));
  }, [osdSlug]);

  function resetForm() {
    setEditingId(null);
    setForm({ department: "", officer_name: "", email: "" });
  }

  function startEdit(contact: OsdDepartmentContactRecord) {
    setEditingId(contact.id);
    setForm({
      department: contact.department,
      officer_name: contact.officer_name,
      email: contact.email,
    });
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateOsdDepartment(osdSlug, editingId, form);
      } else {
        await createOsdDepartment(osdSlug, form);
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
      await updateOsdDepartment(osdSlug, contact.id, { is_active: !contact.is_active });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  return (
    <div className="space-y-5">
      <Card title={editingId ? t("dashboard", "departments.update") : t("dashboard", "departments.create")}>
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3">
          <Input
            label={t("dashboard", "departments.department")}
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
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

      <Card title={t("dashboard", "departments.title")}>
        {items.length === 0 ? (
          <p className="text-sm text-text-muted">{t("dashboard", "departments.empty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((contact) => (
              <li key={contact.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold">{contact.department}</p>
                  <p className="text-text-muted">
                    {contact.officer_name || "—"} · {contact.email || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={contact.is_active ? "success" : "danger"}>
                    {contact.is_active
                      ? t("dashboard", "departments.active")
                      : t("dashboard", "departments.inactive")}
                  </Badge>
                  <Button type="button" size="sm" variant="outline" onClick={() => startEdit(contact)}>
                    Edit
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
