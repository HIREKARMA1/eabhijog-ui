"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  bulkPsTaxonomyTree,
  fetchPsTaxonomyTree,
  updatePsOrganization,
  updatePsTaxonomyDepartmentSpoc,
  updatePsTaxonomySubDepartmentSpoc,
} from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { useI18n } from "@/lib/i18n/context";
import type { TaxonomyDepartment, TaxonomyOrganization, TaxonomySubDepartment, TaxonomyTree } from "@/types/api";

const PS_CATEGORIES = [
  "Commerce & Transport",
  "Steel & Mines",
  "Ganjam District",
  "Gopalpur Constituency",
];

type SpocForm = {
  officer_name: string;
  designation: string;
  email: string;
  whatsapp_number: string;
};

const EMPTY_SPOC: SpocForm = {
  officer_name: "",
  designation: "",
  email: "",
  whatsapp_number: "",
};

function spocFromDept(dept: TaxonomyDepartment): SpocForm {
  return {
    officer_name: dept.officer_name || "",
    designation: dept.designation || "",
    email: dept.email || "",
    whatsapp_number: dept.whatsapp_number || "",
  };
}

function spocFromSub(sub: TaxonomySubDepartment): SpocForm {
  return {
    officer_name: sub.officer_name || "",
    designation: sub.designation || "",
    email: sub.email || "",
    whatsapp_number: sub.whatsapp_number || "",
  };
}

function spocFromOrg(org: TaxonomyOrganization): SpocForm {
  return {
    officer_name: org.officer_name || "",
    designation: org.designation || "",
    email: org.email || "",
    whatsapp_number: org.whatsapp_number || "",
  };
}

function SpocFields({
  form,
  onChange,
}: {
  form: SpocForm;
  onChange: (form: SpocForm) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Input
        label={t("dashboard", "departments.spocName")}
        value={form.officer_name}
        onChange={(e) => onChange({ ...form, officer_name: e.target.value })}
      />
      <Input
        label={t("dashboard", "departments.designation")}
        value={form.designation}
        onChange={(e) => onChange({ ...form, designation: e.target.value })}
      />
      <Input
        label={t("dashboard", "departments.email")}
        type="email"
        value={form.email}
        onChange={(e) => onChange({ ...form, email: e.target.value })}
      />
            <Input
              label={t("dashboard", "departments.whatsappNumber")}
              value={form.whatsapp_number}
              onChange={(e) => onChange({ ...form, whatsapp_number: e.target.value })}
              placeholder="+918144496407"
            />
    </div>
  );
}

export function TaxonomyTreePanel() {
  const { t } = useI18n();
  const [category, setCategory] = useState(PS_CATEGORIES[0]);
  const [tree, setTree] = useState<TaxonomyTree | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [csvText, setCsvText] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [deptSpoc, setDeptSpoc] = useState<SpocForm>(EMPTY_SPOC);
  const [subSpoc, setSubSpoc] = useState<SpocForm>(EMPTY_SPOC);
  const [orgSpoc, setOrgSpoc] = useState<SpocForm>(EMPTY_SPOC);

  const selectedDept = tree?.departments.find((d) => d.id === selectedDeptId) ?? null;
  const selectedSub =
    selectedDept?.sub_departments.find((s) => s.id === selectedSubId) ?? null;
  const selectedOrg =
    selectedSub?.organizations.find((o) => o.id === selectedOrgId) ?? null;

  async function load() {
    const res = await fetchPsTaxonomyTree(category);
    setTree(res.data);
  }

  useEffect(() => {
    load().catch(() => setError(t("common", "errors.generic")));
  }, [category]);

  function clearMessages() {
    setError("");
    setSuccessMessage("");
  }

  function selectDepartment(dept: TaxonomyDepartment) {
    setSelectedDeptId(dept.id);
    setSelectedSubId(null);
    setSelectedOrgId(null);
    setDeptSpoc(spocFromDept(dept));
    clearMessages();
  }

  function selectSubDepartment(sub: TaxonomySubDepartment) {
    setSelectedSubId(sub.id);
    setSelectedOrgId(null);
    setSubSpoc(spocFromSub(sub));
    clearMessages();
  }

  function selectOrganization(org: TaxonomyOrganization) {
    setSelectedOrgId(org.id);
    setOrgSpoc(spocFromOrg(org));
    clearMessages();
  }

  async function onSaveDeptSpoc(e: FormEvent) {
    e.preventDefault();
    if (!selectedDeptId) return;
    clearMessages();
    try {
      await updatePsTaxonomyDepartmentSpoc(selectedDeptId, deptSpoc);
      setSuccessMessage(t("dashboard", "departments.spocSaved"));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  async function onSaveSubSpoc(e: FormEvent) {
    e.preventDefault();
    if (!selectedSubId) return;
    clearMessages();
    try {
      await updatePsTaxonomySubDepartmentSpoc(selectedSubId, subSpoc);
      setSuccessMessage(t("dashboard", "departments.spocSaved"));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  async function onSaveOrgSpoc(e: FormEvent) {
    e.preventDefault();
    if (!selectedOrgId || !selectedOrg) return;
    clearMessages();
    try {
      await updatePsOrganization(selectedOrgId, { ...orgSpoc, name: selectedOrg.name });
      setSuccessMessage(t("dashboard", "departments.spocSaved"));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    }
  }

  async function onBulkUpload(e: FormEvent) {
    e.preventDefault();
    setBulkMessage("");
    clearMessages();
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
          onChange={(e) => {
            setCategory(e.target.value);
            setSelectedDeptId(null);
            setSelectedSubId(null);
            setSelectedOrgId(null);
          }}
        >
          {PS_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <p className="mt-3 text-sm text-text-muted">{t("dashboard", "departments.taxonomyHint")}</p>
      </Card>

      <Card title={t("dashboard", "departments.treeTitle")}>
        {!tree || tree.departments.length === 0 ? (
          <p className="text-sm text-text-muted">{t("dashboard", "departments.empty")}</p>
        ) : (
          <ul className="space-y-4 text-sm">
            {tree.departments.map((dept) => (
              <li key={dept.id}>
                <button
                  type="button"
                  className={`font-semibold ${selectedDeptId === dept.id ? "text-primary" : ""}`}
                  onClick={() => selectDepartment(dept)}
                >
                  {dept.name}
                  {dept.sub_departments.length === 0
                    ? ""
                    : ` (${dept.sub_departments.length} ${t("dashboard", "departments.subDepartment").toLowerCase()})`}
                </button>
                {dept.sub_departments.length > 0 ? (
                  <ul className="mt-2 space-y-2 border-l border-border pl-4">
                    {dept.sub_departments.map((sub) => (
                      <li key={sub.id}>
                        <button
                          type="button"
                          className={`font-medium ${selectedSubId === sub.id ? "text-primary" : ""}`}
                          onClick={() => {
                            selectDepartment(dept);
                            selectSubDepartment(sub);
                          }}
                        >
                          {sub.name} ({sub.organizations.length})
                        </button>
                        {selectedSubId === sub.id ? (
                          <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto pl-3">
                            {sub.organizations.map((org) => (
                              <li key={org.id}>
                                <button
                                  type="button"
                                  className={`text-left ${selectedOrgId === org.id ? "text-primary" : "text-text-muted"}`}
                                  onClick={() => {
                                    selectDepartment(dept);
                                    selectSubDepartment(sub);
                                    selectOrganization(org);
                                  }}
                                >
                                  {org.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {selectedDept && !selectedSub ? (
        <Card title={t("dashboard", "departments.deptSpocTitle", { name: selectedDept.name })}>
          <form onSubmit={onSaveDeptSpoc} className="space-y-3">
            <SpocFields form={deptSpoc} onChange={setDeptSpoc} />
            <Button type="submit" size="sm">
              {t("dashboard", "departments.saveSpoc")}
            </Button>
          </form>
        </Card>
      ) : null}

      {selectedSub && !selectedOrg ? (
        <Card title={t("dashboard", "departments.subSpocTitle", { name: selectedSub.name })}>
          <form onSubmit={onSaveSubSpoc} className="space-y-3">
            <SpocFields form={subSpoc} onChange={setSubSpoc} />
            <Button type="submit" size="sm">
              {t("dashboard", "departments.saveSpoc")}
            </Button>
          </form>
          <p className="mt-3 text-sm text-text-muted">
            {t("dashboard", "departments.selectOrgHint")}
          </p>
        </Card>
      ) : null}

      {selectedOrg ? (
        <Card title={t("dashboard", "departments.orgSpocTitle", { name: selectedOrg.name })}>
          <form onSubmit={onSaveOrgSpoc} className="space-y-3">
            <SpocFields form={orgSpoc} onChange={setOrgSpoc} />
            <Button type="submit" size="sm">
              {t("dashboard", "departments.saveSpoc")}
            </Button>
          </form>
        </Card>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {successMessage ? <p className="text-sm text-success">{successMessage}</p> : null}

      <Card title={t("dashboard", "departments.bulkTitle")}>
        <form onSubmit={onBulkUpload} className="space-y-3">
          <p className="text-sm text-text-muted">{t("dashboard", "departments.treeBulkHint")}</p>
          <textarea
            className="min-h-32 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="department,sub_department,organization,officer_name,designation,email,whatsapp_number"
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
