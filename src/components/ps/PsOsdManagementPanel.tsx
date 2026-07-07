"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Section } from "@/components/ui/Section";
import { Select } from "@/components/ui/Select";
import { ApiError } from "@/lib/api/client";
import {
  activateStaffAccount,
  createStaffAccount,
  deactivateStaffAccount,
  deleteStaffAccountPermanently,
  fetchStaffList,
  fetchStaffRoles,
  updateStaffAccount,
} from "@/lib/api/portal";
import { OSD_DESK_OPTIONS, osdCategoryForRole, osdRoleLabel } from "@/lib/osd/desks";
import { useI18n } from "@/lib/i18n/context";
import type { StaffAccount } from "@/types/api";

type PanelMode = "list" | "create" | "edit";

type AccountForm = {
  username: string;
  password: string;
  role: string;
  name: string;
  email: string;
  designation: string;
  district: string;
  phone: string;
  whatsapp_enabled: boolean;
};

const EMPTY_FORM: AccountForm = {
  username: "",
  password: "",
  role: OSD_DESK_OPTIONS[0].role,
  name: "",
  email: "",
  designation: "Officer on Special Duty",
  district: "Odisha",
  phone: "",
  whatsapp_enabled: false,
};

export function PsOsdManagementPanel() {
  const { t } = useI18n();
  const [items, setItems] = useState<StaffAccount[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mode, setMode] = useState<PanelMode>("list");
  const [editing, setEditing] = useState<StaffAccount | null>(null);
  const [form, setForm] = useState<AccountForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const roleOptions = useMemo(
    () =>
      (roles.length ? roles : OSD_DESK_OPTIONS.map((desk) => desk.role)).map((role) => ({
        value: role,
        label: osdRoleLabel(role),
      })),
    [roles],
  );

  const filteredItems = useMemo(() => {
    if (categoryFilter === "all") return items;
    return items.filter((item) => item.osd_category === categoryFilter);
  }, [categoryFilter, items]);

  async function load() {
    const [listRes, rolesRes] = await Promise.all([fetchStaffList(), fetchStaffRoles()]);
    setItems(listRes.data.items);
    setRoles(rolesRes.data.manageable_roles);
    if (!form.role && rolesRes.data.manageable_roles[0]) {
      setForm((current) => ({ ...current, role: rolesRes.data.manageable_roles[0] }));
    }
  }

  useEffect(() => {
    load()
      .catch(() => setError(t("common", "errors.generic")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetPanel() {
    setMode("list");
    setEditing(null);
    setForm({ ...EMPTY_FORM, role: roles[0] ?? OSD_DESK_OPTIONS[0].role });
    setError("");
  }

  function startCreate() {
    setMode("create");
    setEditing(null);
    setForm({ ...EMPTY_FORM, role: roles[0] ?? OSD_DESK_OPTIONS[0].role });
    setError("");
    setMessage("");
  }

  function startEdit(account: StaffAccount) {
    setMode("edit");
    setEditing(account);
    setForm({
      username: account.username,
      password: "",
      role: account.role,
      name: account.name,
      email: account.email,
      designation: account.designation,
      district: account.district,
      phone: account.phone,
      whatsapp_enabled: account.whatsapp_enabled,
    });
    setError("");
    setMessage("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (mode === "create") {
        await createStaffAccount({
          ...form,
          osd_category: osdCategoryForRole(form.role),
        });
        setMessage(t("ps", "osd.created"));
      } else if (editing) {
        const payload: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          designation: form.designation,
          district: form.district,
          phone: form.phone,
          whatsapp_enabled: form.whatsapp_enabled,
        };
        if (form.password.trim()) payload.password = form.password;
        await updateStaffAccount(editing.id, payload);
        setMessage(t("ps", "osd.updated"));
      }
      await load();
      resetPanel();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(account: StaffAccount) {
    setError("");
    setMessage("");
    try {
      if (account.is_active) await deactivateStaffAccount(account.id);
      else await activateStaffAccount(account.id);
      await load();
      setMessage(
        account.is_active ? t("ps", "osd.deactivated") : t("ps", "osd.activated"),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  async function deleteAccount(account: StaffAccount) {
    const confirmed = window.confirm(
      t("ps", "osd.deleteConfirm", { name: account.name, username: account.username }),
    );
    if (!confirmed) return;

    setError("");
    setMessage("");
    try {
      await deleteStaffAccountPermanently(account.id);
      if (editing?.id === account.id) resetPanel();
      await load();
      setMessage(t("ps", "osd.deleted"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  return (
    <div className="space-y-6">
      <Section title={t("ps", "osd.title")}>
        <p className="text-sm text-text-muted">{t("ps", "osd.subtitle")}</p>
      </Section>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={categoryFilter === "all" ? "primary" : "outline"}
            onClick={() => setCategoryFilter("all")}
          >
            {t("ps", "osd.allDesks")}
          </Button>
          {OSD_DESK_OPTIONS.map((desk) => (
            <Button
              key={desk.category}
              type="button"
              size="sm"
              variant={categoryFilter === desk.category ? "primary" : "outline"}
              onClick={() => setCategoryFilter(desk.category)}
            >
              {desk.category}
            </Button>
          ))}
        </div>
        {mode === "list" ? (
          <Button type="button" size="sm" onClick={startCreate}>
            {t("ps", "osd.add")}
          </Button>
        ) : null}
      </div>

      {mode !== "list" ? (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm ring-1 ring-black/[0.02] md:border-l-[3px] md:border-l-blue-600"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            {mode === "create" ? t("ps", "osd.add") : t("ps", "osd.edit")}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {mode === "create" ? (
              <>
                <Input
                  label={t("ps", "osd.username")}
                  value={form.username}
                  required
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <PasswordInput
                  label={t("ps", "osd.password")}
                  value={form.password}
                  required
                  minLength={8}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <Select
                  label={t("ps", "osd.desk")}
                  value={form.role}
                  options={roleOptions}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </>
            ) : null}
            <Input
              label={t("ps", "osd.fullName")}
              value={form.name}
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label={t("ps", "osd.email")}
              type="email"
              value={form.email}
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label={t("ps", "osd.designation")}
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
            />
            <Input
              label={t("ps", "osd.district")}
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            />
            <Input
              label={t("ps", "osd.phone")}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            {mode === "edit" ? (
              <PasswordInput
                label={t("ps", "osd.newPassword")}
                value={form.password}
                minLength={8}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            ) : null}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              className="mt-0.5 accent-saffron"
              checked={form.whatsapp_enabled}
              onChange={(e) => setForm({ ...form, whatsapp_enabled: e.target.checked })}
            />
            <span>{t("ps", "osd.whatsappAlerts")}</span>
          </label>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={resetPanel} disabled={saving}>
              {t("ps", "osd.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "…" : mode === "create" ? t("ps", "osd.create") : t("ps", "osd.save")}
            </Button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-saffron border-t-transparent" />
        </div>
      ) : (
        <DataTable
          rows={filteredItems}
          rowKey={(row) => String(row.id)}
          emptyMessage={t("ps", "osd.empty")}
          columns={[
            {
              key: "desk",
              header: t("ps", "osd.desk"),
              cell: (row) => <span className="font-medium">{row.osd_category ?? osdRoleLabel(row.role)}</span>,
            },
            {
              key: "name",
              header: t("ps", "osd.fullName"),
              cell: (row) => (
                <div>
                  <p className="font-medium text-slate-900">{row.name}</p>
                  <p className="text-xs text-text-muted">{row.username}</p>
                </div>
              ),
            },
            {
              key: "email",
              header: t("ps", "osd.email"),
              cell: (row) => row.email,
            },
            {
              key: "phone",
              header: t("ps", "osd.phone"),
              cell: (row) => row.phone || "—",
            },
            {
              key: "status",
              header: t("ps", "osd.status"),
              cell: (row) => (
                <Badge tone={row.is_active ? "success" : "danger"}>
                  {row.is_active ? t("ps", "osd.active") : t("ps", "osd.inactive")}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: t("ps", "osd.actions"),
              className: "text-right",
              cell: (row) => (
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => startEdit(row)}>
                    {t("ps", "osd.edit")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={row.is_active ? "outline" : "secondary"}
                    onClick={() => toggleActive(row)}
                  >
                    {row.is_active ? t("ps", "osd.deactivate") : t("ps", "osd.activate")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => deleteAccount(row)}
                  >
                    {t("ps", "osd.delete")}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
