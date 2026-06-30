"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  activateStaffAccount,
  createStaffAccount,
  deactivateStaffAccount,
  fetchStaffList,
  fetchStaffRoles,
} from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import type { StaffAccount } from "@/types/api";

export function StaffManagementPanel() {
  const { t } = useI18n();
  const [items, setItems] = useState<StaffAccount[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "",
    name: "",
    email: "",
    designation: "",
    district: "Odisha",
  });

  async function load() {
    const [listRes, rolesRes] = await Promise.all([fetchStaffList(), fetchStaffRoles()]);
    setItems(listRes.data.items);
    setRoles(rolesRes.data.manageable_roles);
    if (!form.role && rolesRes.data.manageable_roles[0]) {
      setForm((f) => ({ ...f, role: rolesRes.data.manageable_roles[0] }));
    }
  }

  useEffect(() => {
    load().catch(() => setError(t("common", "errors.generic")));
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createStaffAccount(form);
      await load();
      setForm((f) => ({ ...f, username: "", password: "", name: "", email: "" }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  async function toggleActive(account: StaffAccount) {
    if (account.is_active) await deactivateStaffAccount(account.id);
    else await activateStaffAccount(account.id);
    await load();
  }

  return (
    <div className="space-y-5">
      <Card title={t("dashboard", "staff.create")}>
        <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-2">
          <Input label={t("dashboard", "staff.username")} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Select
            label={t("dashboard", "staff.role")}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={roles.map((r) => ({ value: r, label: r.replace(/_/g, " ") }))}
          />
          {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
          <Button type="submit" className="md:col-span-2">{t("dashboard", "staff.save")}</Button>
        </form>
      </Card>

      <Card title={t("dashboard", "staff.title")}>
        <ul className="divide-y divide-border">
          {items.map((account) => (
            <li key={account.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-semibold">{account.name}</p>
                <p className="text-text-muted">{account.username} · {account.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={account.is_active ? "success" : "danger"}>
                  {account.is_active ? t("dashboard", "staff.active") : t("dashboard", "staff.inactive")}
                </Badge>
                <Button type="button" size="sm" variant="outline" onClick={() => toggleActive(account)}>
                  {account.is_active ? t("dashboard", "staff.deactivate") : t("dashboard", "staff.activate")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
