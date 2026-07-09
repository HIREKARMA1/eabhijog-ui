"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  bulkPsTaxonomyTree,
  createPsOrganization,
  fetchPsTaxonomyTree,
  updatePsOrganization,
} from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import type { TaxonomyTree } from "@/types/api";

const PS_CATEGORIES = [
  "Commerce & Transport",
  "Steel & Mines",
  "Ganjam District",
  "Gopalpur Constituency",
];

export function TaxonomyTreePanel() {
  const { t } = useI18n();
  const [category, setCategory] = useState(PS_CATEGORIES[0]);
  const [tree, setTree] = useState<TaxonomyTree | null>(null);
  const [error, setError] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [csvText, setCsvText] = useState("");
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [editingOrgId, setEditingOrgId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    officer_name: "",
    email: "",
    whatsapp_number: "",
  });

  async function load() {
    const res = await fetchPsTaxonomyTree(category);
    setTree(res.data);
  }

  useEffect(() => {
    load().catch(() => setError(t("common", "errors.generic")));
  }, [category]);

  function resetForm() {
    setEditingOrgId(null);
    setForm({ name: "", officer_name: "", email: "", whatsapp_number: "" });
  }

  async function onSubmitOrg(e: FormEvent) {
    e.preventDefault();
    if (!selectedSubId) return;
    setError("");
    try {
      if (editingOrgId) {
        await updatePsOrganization(editingOrgId, form);
      } else {
        await createPsOrganization(selectedSubId, form);
      }
      await load();
      resetForm();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  async function onBulkUpload(e: FormEvent) {
    e.preventDefault();
    setBulkMessage("");
    setError("");
    try {
      const result = await bulkPsTaxonomyTree(csvText, category);
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
      <Card title={t("dashboard", "departments.category")}>
        <select
          className="w-full max-w-md rounded-md border border-border bg-surface px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {PS_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </Card>

      <Card title={t("dashboard", "departments.treeTitle")}>
        {!tree || tree.departments.length === 0 ? (
          <p className="text-sm text-text-muted">{t("dashboard", "departments.empty")}</p>
        ) : (
          <ul className="space-y-4 text-sm">
            {tree.departments.map((dept) => (
              <li key={dept.id}>
                <p className="font-semibold">{dept.name}</p>
                <ul className="mt-2 space-y-2 border-l border-border pl-4">
                  {dept.sub_departments.map((sub) => (
                    <li key={sub.id}>
                      <button
                        type="button"
                        className={`font-medium ${selectedSubId === sub.id ? "text-primary" : ""}`}
                        onClick={() => {
                          setSelectedSubId(sub.id);
                          resetForm();
                        }}
                      >
                        {sub.name} ({sub.organizations.length})
                      </button>
                      {selectedSubId === sub.id ? (
                        <ul className="mt-1 space-y-1 pl-3">
                          {sub.organizations.map((org) => (
                            <li key={org.id} className="flex flex-wrap items-center gap-2">
                              <span>{org.name}</span>
                              <span className="text-text-muted">{org.email || "—"}</span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingOrgId(org.id);
                                  setForm({
                                    name: org.name,
                                    officer_name: org.officer_name,
                                    email: org.email,
                                    whatsapp_number: org.whatsapp_number,
                                  });
                                }}
                              >
                                {t("dashboard", "departments.update")}
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {selectedSubId ? (
        <Card title={editingOrgId ? t("dashboard", "departments.updateOrg") : t("dashboard", "departments.addOrg")}>
          <form onSubmit={onSubmitOrg} className="grid gap-3 md:grid-cols-2">
            <Input
              label={t("dashboard", "departments.organization")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label={t("dashboard", "departments.officerName")}
              value={form.officer_name}
              onChange={(e) => setForm({ ...form, officer_name: e.target.value })}
            />
            <Input
              label={t("dashboard", "departments.email")}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label={t("dashboard", "departments.whatsappNumber")}
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
            />
            {error ? <p className="text-sm text-danger md:col-span-2">{error}</p> : null}
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit">{t("dashboard", "departments.save")}</Button>
              {editingOrgId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      ) : null}

      <Card title={t("dashboard", "departments.bulkTitle")}>
        <form onSubmit={onBulkUpload} className="space-y-3">
          <p className="text-sm text-text-muted">{t("dashboard", "departments.treeBulkHint")}</p>
          <textarea
            className="min-h-32 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="department,sub_department,organization,officer_name,email,whatsapp_number"
          />
          {bulkMessage ? <p className="text-sm text-success">{bulkMessage}</p> : null}
          <Button type="submit" variant="outline">
            {t("dashboard", "departments.bulkUpload")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
