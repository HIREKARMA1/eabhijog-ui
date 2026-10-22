"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { fetchEmployeeLookups, saveEmployeeLookup, bulkEmployeeLookups } from "@/lib/api/portal";
import { ApiError } from "@/lib/api/client";
import type { EmployeeLookup } from "@/types/api";

type EmployeeFields = Omit<EmployeeLookup, "id">;
const emptyEmployee: EmployeeFields = {
  name: "",
  designation: "",
  department: "",
  service: "",
  mobile_number: "",
  email: "",
};

function downloadTemplate() {
  const csv = "name,designation,department,service,mobile_number,email\r\n";
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "employee-lookups-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function EmployeeLookupsPanel({ osdSlug }: { osdSlug: string }) {
  const [form, setForm] = useState<EmployeeFields>(emptyEmployee);
  const [items, setItems] = useState<EmployeeLookup[]>([]);
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadItems = useCallback(async (term = "") => {
    const response = await fetchEmployeeLookups(osdSlug, term, 500);
    setItems(response.data?.items ?? []);
  }, [osdSlug]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadItems(query).catch((err) => setError(errorMessage(err)));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loadItems, query]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await saveEmployeeLookup(osdSlug, form);
      setNotice(response.message || "Employee saved.");
      setForm(emptyEmployee);
      await loadItems(query);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onUpload() {
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await bulkEmployeeLookups(osdSlug, await file.text());
      const result = response.data;
      setNotice(
        `Upload complete: ${result?.created ?? 0} created, ${result?.updated ?? 0} updated, ${result?.skipped ?? 0} blank rows skipped.`,
      );
      setFile(null);
      await loadItems(query);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card title="Add an employee" subtitle="Name and mobile number are required. Other details are optional.">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Name *" value={form.name} required maxLength={200} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Mobile number *" value={form.mobile_number} required maxLength={32} type="tel" placeholder="+91 9876543210" onChange={(e) => setForm({ ...form, mobile_number: e.target.value })} />
            <Input label="Designation" value={form.designation} maxLength={200} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            <Input label="Department" value={form.department} maxLength={200} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <Input label="Service" value={form.service} maxLength={200} onChange={(e) => setForm({ ...form, service: e.target.value })} />
            <Input label="Email" value={form.email} type="email" maxLength={255} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Button type="submit" loading={busy}>Save employee</Button>
        </form>
      </Card>

      <Card title="Bulk upload" subtitle="Upload a CSV file using the provided column headers. Existing mobile numbers are updated.">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <Input label="Employee CSV" type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <Button type="button" variant="outline" onClick={downloadTemplate}>Download template</Button>
          <Button type="button" onClick={onUpload} disabled={!file || busy} loading={busy}>Upload employees</Button>
        </div>
        <p className="mt-2 text-xs text-text-muted">Required columns: name, mobile_number. Optional columns: designation, department, service, email.</p>
      </Card>

      <Card title="Employee directory" subtitle={`${items.length} employee${items.length === 1 ? "" : "s"} shown`}>
        <div className="mb-4 max-w-md">
          <Input label="Search employees" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, designation, department, service, mobile or email" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-text-muted">
              <tr>
                {["Name", "Designation", "Department", "Service", "Mobile number", "Email"].map((label) => (
                  <th key={label} className="truncate whitespace-nowrap px-3 py-2 font-semibold" title={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-3 py-3 font-medium text-slate-900"><span className="block truncate whitespace-nowrap" title={employee.name}>{employee.name}</span></td>
                  <td className="px-3 py-3"><span className="block truncate whitespace-nowrap" title={employee.designation}>{employee.designation || "—"}</span></td>
                  <td className="px-3 py-3"><span className="block truncate whitespace-nowrap" title={employee.department}>{employee.department || "—"}</span></td>
                  <td className="px-3 py-3"><span className="block truncate whitespace-nowrap" title={employee.service}>{employee.service || "—"}</span></td>
                  <td className="px-3 py-3"><span className="block truncate whitespace-nowrap" title={employee.mobile_number}>{employee.mobile_number}</span></td>
                  <td className="px-3 py-3"><span className="block truncate whitespace-nowrap" title={employee.email}>{employee.email || "—"}</span></td>
                </tr>
              ))}
              {items.length === 0 ? <tr><td colSpan={6} className="px-3 py-8 text-center text-text-muted">No employees found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>

      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      {notice ? <p role="status" className="text-sm text-success">{notice}</p> : null}
    </div>
  );
}
