"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SectionLoader } from "@/components/ui/Spinner";
import {
  bulkPsTaxonomyTree,
  fetchPsTaxonomyTree,
  updatePsOrganization,
  updatePsTaxonomyDepartmentSpoc,
  updatePsTaxonomySubDepartmentSpoc,
} from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n/context";
import type { TaxonomyDepartment, TaxonomyOrganization, TaxonomySubDepartment, TaxonomyTree } from "@/types/api";

const PS_CATEGORIES = [
  "Commerce & Transport",
  "Steel & Mines",
  "Ganjam District",
  "Gopalpur Constituency",
];

const TAXONOMY_CSV_TEMPLATE = `department,sub_department,organization,officer_name,designation,email,whatsapp_number
STA (RTO),Cuttack RTO,Regional Transport Office - Cuttack,Jane Doe,RTO,officer@example.com,+91XXXXXXXXXX`;

function downloadTaxonomyCsvTemplate() {
  const blob = new Blob([TAXONOMY_CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "department_taxonomy_template.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

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

function spocIsConfigured(form: SpocForm) {
  return Boolean(form.officer_name.trim() || form.email.trim());
}

function SpocFields({
  form,
  onChange,
  disabled,
}: {
  form: SpocForm;
  onChange: (form: SpocForm) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        label={t("dashboard", "departments.spocName")}
        value={form.officer_name}
        onChange={(e) => onChange({ ...form, officer_name: e.target.value })}
        disabled={disabled}
      />
      <Input
        label={t("dashboard", "departments.designation")}
        value={form.designation}
        onChange={(e) => onChange({ ...form, designation: e.target.value })}
        disabled={disabled}
      />
      <Input
        label={t("dashboard", "departments.email")}
        type="email"
        value={form.email}
        onChange={(e) => onChange({ ...form, email: e.target.value })}
        disabled={disabled}
      />
      <Input
        label={t("dashboard", "departments.whatsappNumber")}
        value={form.whatsapp_number}
        onChange={(e) => onChange({ ...form, whatsapp_number: e.target.value })}
        placeholder="+91XXXXXXXXXX"
        disabled={disabled}
      />
    </div>
  );
}

type TreeRowProps = {
  label: string;
  depth: number;
  configured: boolean;
  selected: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onSelect: () => void;
};

function TreeRow({
  label,
  depth,
  configured,
  selected,
  expandable,
  expanded,
  onToggleExpand,
  onSelect,
}: TreeRowProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center" style={{ paddingLeft: `${depth * 16}px` }}>
      {expandable ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse" : "Expand"}
          className="flex h-8 w-7 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.();
          }}
        >
          <Icon
            name="chevron-right"
            size={14}
            className={cn("transition-transform duration-150", expanded && "rotate-90")}
          />
        </button>
      ) : (
        <span className="w-7 shrink-0" aria-hidden />
      )}
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "group flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
          selected
            ? "bg-navy-700 text-white"
            : "text-slate-800 hover:bg-slate-100",
          depth === 0 && !selected && "font-semibold",
          depth > 0 && !selected && "font-normal",
        )}
      >
        <span className="truncate">{label}</span>
        <span
          className={cn(
            "shrink-0 text-[11px]",
            selected
              ? configured
                ? "text-emerald-200"
                : "text-amber-200"
              : configured
                ? "text-emerald-600"
                : "text-amber-600",
          )}
          title={
            configured
              ? t("dashboard", "departments.spocConfigured")
              : t("dashboard", "departments.spocNotConfigured")
          }
        >
          <span
            className={cn(
              "mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle",
              configured ? "bg-emerald-500" : "bg-amber-500",
              selected && (configured ? "bg-emerald-300" : "bg-amber-300"),
            )}
            aria-hidden
          />
          {configured
            ? t("dashboard", "departments.spocConfigured")
            : t("dashboard", "departments.spocNotConfigured")}
        </span>
      </button>
    </div>
  );
}

export function TaxonomyTreePanel() {
  const { t } = useI18n();
  const editorRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState(PS_CATEGORIES[0]);
  const [tree, setTree] = useState<TaxonomyTree | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [csvText, setCsvText] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [expandedDeptIds, setExpandedDeptIds] = useState<Set<number>>(new Set());
  const [deptSpoc, setDeptSpoc] = useState<SpocForm>(EMPTY_SPOC);
  const [subSpoc, setSubSpoc] = useState<SpocForm>(EMPTY_SPOC);
  const [orgSpoc, setOrgSpoc] = useState<SpocForm>(EMPTY_SPOC);

  const selectedDept = tree?.departments.find((d) => d.id === selectedDeptId) ?? null;
  const selectedSub = selectedDept?.sub_departments.find((s) => s.id === selectedSubId) ?? null;
  const selectedOrg = selectedSub?.organizations.find((o) => o.id === selectedOrgId) ?? null;
  const hasSelection = Boolean(selectedDept || selectedSub || selectedOrg);

  async function load() {
    const res = await fetchPsTaxonomyTree(category);
    setTree(res.data);
    setExpandedDeptIds(new Set(res.data.departments.map((d) => d.id)));
  }

  useEffect(() => {
    setLoading(true);
    load()
      .catch(() => setError(t("common", "errors.generic")))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    if (!tree) return;
    const dept = tree.departments.find((d) => d.id === selectedDeptId);
    if (!dept) return;
    if (selectedOrgId) {
      const sub = dept.sub_departments.find((s) => s.id === selectedSubId);
      const org = sub?.organizations.find((o) => o.id === selectedOrgId);
      if (org) setOrgSpoc(spocFromOrg(org));
      return;
    }
    if (selectedSubId) {
      const sub = dept.sub_departments.find((s) => s.id === selectedSubId);
      if (sub) setSubSpoc(spocFromSub(sub));
      return;
    }
    setDeptSpoc(spocFromDept(dept));
  }, [tree, selectedDeptId, selectedSubId, selectedOrgId]);

  useEffect(() => {
    if (!hasSelection) return;
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedDeptId, selectedSubId, selectedOrgId, hasSelection]);

  function clearMessages() {
    setError("");
    setSuccessMessage("");
  }

  function toggleDeptExpand(deptId: number) {
    setExpandedDeptIds((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) next.delete(deptId);
      else next.add(deptId);
      return next;
    });
  }

  function selectDepartment(dept: TaxonomyDepartment) {
    setSelectedDeptId(dept.id);
    setSelectedSubId(null);
    setSelectedOrgId(null);
    setDeptSpoc(spocFromDept(dept));
    setExpandedDeptIds((prev) => new Set(prev).add(dept.id));
    clearMessages();
  }

  function selectSubDepartment(dept: TaxonomyDepartment, sub: TaxonomySubDepartment) {
    setSelectedDeptId(dept.id);
    setSelectedSubId(sub.id);
    setSelectedOrgId(null);
    setSubSpoc(spocFromSub(sub));
    setExpandedDeptIds((prev) => new Set(prev).add(dept.id));
    clearMessages();
  }

  function selectOrganization(
    dept: TaxonomyDepartment,
    sub: TaxonomySubDepartment,
    org: TaxonomyOrganization,
  ) {
    setSelectedDeptId(dept.id);
    setSelectedSubId(sub.id);
    setSelectedOrgId(org.id);
    setOrgSpoc(spocFromOrg(org));
    setExpandedDeptIds((prev) => new Set(prev).add(dept.id));
    clearMessages();
  }

  async function onSaveDeptSpoc(e: FormEvent) {
    e.preventDefault();
    if (!selectedDeptId) return;
    clearMessages();
    setSaving(true);
    try {
      await updatePsTaxonomyDepartmentSpoc(selectedDeptId, deptSpoc);
      setSuccessMessage(t("dashboard", "departments.spocSaved"));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  async function onSaveSubSpoc(e: FormEvent) {
    e.preventDefault();
    if (!selectedSubId) return;
    clearMessages();
    setSaving(true);
    try {
      await updatePsTaxonomySubDepartmentSpoc(selectedSubId, subSpoc);
      setSuccessMessage(t("dashboard", "departments.spocSaved"));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    } finally {
      setSaving(false);
    }
  }

  async function onSaveOrgSpoc(e: FormEvent) {
    e.preventDefault();
    if (!selectedOrgId || !selectedOrg) return;
    clearMessages();
    setSaving(true);
    try {
      await updatePsOrganization(selectedOrgId, { ...orgSpoc, name: selectedOrg.name });
      setSuccessMessage(t("dashboard", "departments.spocSaved"));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common", "errors.generic"));
    } finally {
      setSaving(false);
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

  function selectionPath(): string {
    if (selectedOrg && selectedSub && selectedDept) {
      return `${selectedDept.name} › ${selectedSub.name} › ${selectedOrg.name}`;
    }
    if (selectedSub && selectedDept) {
      return `${selectedDept.name} › ${selectedSub.name}`;
    }
    if (selectedDept) {
      return selectedDept.name;
    }
    return "";
  }

  function editorTitle(): string {
    if (selectedOrg) return selectedOrg.name;
    if (selectedSub) return selectedSub.name;
    if (selectedDept) return selectedDept.name;
    return "";
  }

  function editorLevelLabel(): string {
    if (selectedOrg) return t("dashboard", "departments.taxonomyLevelOrg");
    if (selectedSub) return t("dashboard", "departments.taxonomyLevelSub");
    if (selectedDept) return t("dashboard", "departments.taxonomyLevelDept");
    return "";
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">{t("dashboard", "departments.taxonomySubtitle")}</p>

      <div className="grid gap-4 lg:grid-cols-5 lg:items-start">
        {/* Left: category + tree */}
        <section className="overflow-hidden rounded-xl border border-border bg-surface-card shadow-sm lg:col-span-2">
          <div className="border-b border-border px-4 py-3">
            <Select
              label={t("dashboard", "departments.category")}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSelectedDeptId(null);
                setSelectedSubId(null);
                setSelectedOrgId(null);
                clearMessages();
              }}
              options={PS_CATEGORIES.map((item) => ({ value: item, label: item }))}
            />
          </div>

          <div className="border-b border-border px-4 py-2.5">
            <h2 className="text-sm font-semibold text-slate-900">
              {t("dashboard", "departments.treeTitle")}
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              {t("dashboard", "departments.taxonomyTreeHint")}
            </p>
          </div>

          <div className="max-h-112 overflow-y-auto px-2 py-2">
            {loading ? (
              <SectionLoader label={t("common", "actions.loading")} />
            ) : !tree || tree.departments.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-text-muted">
                {t("dashboard", "departments.empty")}
              </p>
            ) : (
              tree.departments.map((dept) => {
                const deptExpanded = expandedDeptIds.has(dept.id);
                const hasChildren = dept.sub_departments.length > 0;

                return (
                  <div key={dept.id} className="mb-0.5">
                    <TreeRow
                      label={dept.name}
                      depth={0}
                      configured={spocIsConfigured(spocFromDept(dept))}
                      selected={selectedDeptId === dept.id && !selectedSubId && !selectedOrgId}
                      expandable={hasChildren}
                      expanded={deptExpanded}
                      onToggleExpand={() => toggleDeptExpand(dept.id)}
                      onSelect={() => selectDepartment(dept)}
                    />
                    {hasChildren && deptExpanded
                      ? dept.sub_departments.map((sub) => (
                          <div key={sub.id}>
                            <TreeRow
                              label={sub.name}
                              depth={1}
                              configured={spocIsConfigured(spocFromSub(sub))}
                              selected={selectedSubId === sub.id && !selectedOrgId}
                              expandable={
                                dept.name !== "OSRTC" && sub.organizations.length > 0
                              }
                              expanded={selectedSubId === sub.id}
                              onToggleExpand={() => selectSubDepartment(dept, sub)}
                              onSelect={() => selectSubDepartment(dept, sub)}
                            />
                            {selectedSubId === sub.id && sub.organizations.length > 0
                              ? dept.name === "OSRTC"
                                ? null
                                : sub.organizations.map((org) => (
                                    <TreeRow
                                      key={org.id}
                                      label={org.name}
                                      depth={2}
                                      configured={spocIsConfigured(spocFromOrg(org))}
                                      selected={selectedOrgId === org.id}
                                      onSelect={() => selectOrganization(dept, sub, org)}
                                    />
                                  ))
                              : null}
                          </div>
                        ))
                      : null}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right: editor */}
        <section
          ref={editorRef}
          className="overflow-hidden rounded-xl border border-border bg-surface-card shadow-sm lg:col-span-3"
        >
          {!hasSelection ? (
            <div className="flex min-h-88 flex-col items-center justify-center px-6 py-12 text-center">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Icon name="departments" size={22} />
              </span>
              <p className="text-sm font-medium text-slate-800">
                {t("dashboard", "departments.taxonomySelectTitle")}
              </p>
              <p className="mt-1 max-w-xs text-sm text-text-muted">
                {t("dashboard", "departments.taxonomySelectHint")}
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-border px-4 py-3 sm:px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {editorLevelLabel()} SPOC
                </p>
                <h2 className="mt-0.5 text-base font-semibold text-slate-900">{editorTitle()}</h2>
                <p className="mt-1 text-xs text-text-muted">
                  <span className="font-medium text-slate-600">
                    {t("dashboard", "departments.taxonomyPath")}:
                  </span>{" "}
                  {selectionPath()}
                </p>
              </div>

              <div className="space-y-4 px-4 py-4 sm:px-5">
                {selectedOrg ? (
                  <form onSubmit={onSaveOrgSpoc} className="space-y-4">
                    <SpocFields form={orgSpoc} onChange={setOrgSpoc} disabled={saving} />
                    <div className="flex items-center gap-3">
                      <Button type="submit" loading={saving}>
                        {t("dashboard", "departments.saveSpoc")}
                      </Button>
                      {successMessage ? (
                        <p className="text-sm text-success">{successMessage}</p>
                      ) : null}
                    </div>
                  </form>
                ) : selectedSub ? (
                  <div className="space-y-4">
                    <form onSubmit={onSaveSubSpoc} className="space-y-4">
                      <SpocFields form={subSpoc} onChange={setSubSpoc} disabled={saving} />
                      <div className="flex items-center gap-3">
                        <Button type="submit" loading={saving}>
                          {t("dashboard", "departments.saveSpoc")}
                        </Button>
                        {successMessage ? (
                          <p className="text-sm text-success">{successMessage}</p>
                        ) : null}
                      </div>
                    </form>
                    {selectedSub.organizations.length > 0 ? (
                      <p className="text-xs text-text-muted">
                        {t("dashboard", "departments.selectOrgHint")}
                      </p>
                    ) : null}
                  </div>
                ) : selectedDept ? (
                  <form onSubmit={onSaveDeptSpoc} className="space-y-4">
                    <SpocFields form={deptSpoc} onChange={setDeptSpoc} disabled={saving} />
                    <div className="flex items-center gap-3">
                      <Button type="submit" loading={saving}>
                        {t("dashboard", "departments.saveSpoc")}
                      </Button>
                      {successMessage ? (
                        <p className="text-sm text-success">{successMessage}</p>
                      ) : null}
                    </div>
                  </form>
                ) : null}

                {error ? <p className="text-sm text-danger">{error}</p> : null}
              </div>
            </>
          )}
        </section>
      </div>

      {!hasSelection && error ? <p className="text-sm text-danger">{error}</p> : null}

      <details className="rounded-xl border border-border bg-surface-card shadow-sm">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 sm:px-5">
          {t("dashboard", "departments.taxonomyBulkAdvanced")}
        </summary>
        <div className="border-t border-border px-4 py-4 sm:px-5">
          <form onSubmit={onBulkUpload} className="space-y-3">
            <p className="text-sm text-text-muted">{t("dashboard", "departments.treeBulkHint")}</p>
            <textarea
              className="min-h-28 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="department,sub_department,organization,officer_name,designation,email,whatsapp_number"
            />
            {bulkMessage ? <p className="text-sm text-success">{bulkMessage}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={downloadTaxonomyCsvTemplate}>
                {t("dashboard", "departments.bulkDownloadTemplate")}
              </Button>
              <Button type="submit" variant="outline" size="sm">
                {t("dashboard", "departments.bulkUpload")}
              </Button>
            </div>
          </form>
        </div>
      </details>
    </div>
  );
}
