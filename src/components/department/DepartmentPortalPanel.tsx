"use client";

import { FormEvent, useEffect, useState } from "react";

import { LangSwitcher } from "@/components/i18n/LangSwitcher";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  acknowledgeDepartmentGrievance,
  fetchDepartmentGrievance,
  respondDepartmentGrievance,
} from "@/lib/api/department";
import { ApiError } from "@/lib/api/client";
import { Bi } from "@/lib/i18n/bi";
import type { DepartmentGrievanceView } from "@/types/api";

type DepartmentPortalPanelProps = {
  token: string;
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DepartmentPortalPanel({ token }: DepartmentPortalPanelProps) {
  const [view, setView] = useState<DepartmentGrievanceView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ackOfficer, setAckOfficer] = useState("");
  const [ackRemarks, setAckRemarks] = useState("");
  const [respondOfficer, setRespondOfficer] = useState("");
  const [responseText, setResponseText] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await fetchDepartmentGrievance(token);
      setView(result.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load grievance.");
      setView(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function onAcknowledge(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setNotice("");
    setError("");
    try {
      await acknowledgeDepartmentGrievance(token, {
        officer_name: ackOfficer.trim(),
        remarks: ackRemarks.trim() || undefined,
      });
      setNotice("acknowledged");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not acknowledge grievance.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onRespond(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setNotice("");
    setError("");
    try {
      await respondDepartmentGrievance(token, {
        officer_name: respondOfficer.trim(),
        response_text: responseText.trim(),
      });
      setNotice("responded");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit response.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="p-8 text-sm text-text-muted">Loading grievance…</p>;
  }

  if (!view) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <Card title="Department portal">
          <p className="text-sm text-red-700">{error || "Grievance not found or link expired."}</p>
        </Card>
      </div>
    );
  }

  const canAcknowledge = view.allowed_actions.includes("acknowledge");
  const canRespond = view.allowed_actions.includes("respond");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-slate-900">e-Abhijog</div>
            <div className="text-xs text-slate-500">
              <Bi en="Department Grievance Portal · Govt. of Odisha" or="ବିଭାଗ ଅଭିଯୋଗ ପୋର୍ଟାଲ · ଓଡ଼ିଶା ସରକାର" />
            </div>
          </div>
          <LangSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {notice === "acknowledged" ? (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <Bi en="Receipt acknowledged successfully." or="ରସିଦ ସଫଳତାର ସହ ସ୍ୱୀକୃତ ହୋଇଛି।" />
          </div>
        ) : null}
        {notice === "responded" ? (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <Bi
              en="Response recorded and shared with citizen."
              or="ପ୍ରତିକ୍ରିୟା ରେକର୍ଡ ହୋଇ ନାଗରିକଙ୍କ ସହ ସଂଯୁକ୍ତ ହୋଇଛି।"
            />
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <Card title={view.reference_number} subtitle={view.recipient_department}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <Badge tone="default">{view.status.replaceAll("_", " ")}</Badge>
            {view.sla_deadline_at ? (
              <p className="text-sm text-amber-800">
                <Bi en="SLA deadline:" or="SLA ସମୟସୀମା:" />{" "}
                <strong>{formatDate(view.sla_deadline_at)}</strong>
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-slate-500">
                <Bi en="Citizen:" or="ନାଗରିକ:" />
              </span>{" "}
              <strong>{view.citizen_name}</strong>
            </div>
            <div>
              <span className="text-slate-500">
                <Bi en="Phone:" or="ଫୋନ:" />
              </span>{" "}
              <span className="font-mono">{view.citizen_phone}</span>
            </div>
            <div>
              <span className="text-slate-500">
                <Bi en="District:" or="ଜିଲ୍ଲା:" />
              </span>{" "}
              {view.geographic_district}
            </div>
            <div>
              <span className="text-slate-500">
                <Bi en="Category:" or="ବର୍ଗ:" />
              </span>{" "}
              {view.osd_category}
            </div>
          </div>

          <div className="mt-4 text-sm">
            <span className="text-slate-500">
              <Bi en="Title:" or="ଶୀର୍ଷକ:" />
            </span>
            <p className="mt-1 font-medium">{view.title}</p>
          </div>

          <div className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-sm">
            {view.grievance_text}
          </div>

          {view.department_response_text ? (
            <div className="mt-4 border-t pt-4 text-sm">
              <span className="text-slate-500">
                <Bi en="Previous response:" or="ପୂର୍ବ ପ୍ରତିକ୍ରିୟା:" />
              </span>
              <p className="mt-1 rounded bg-green-50 p-3">{view.department_response_text}</p>
            </div>
          ) : null}
        </Card>

        {canAcknowledge ? (
          <Card
            title="Acknowledge Receipt"
            subtitle="ରସିଦ ସ୍ୱୀକାର"
            className="mt-6"
          >
            <form className="space-y-3" onSubmit={onAcknowledge}>
              <Input
                label="Officer name"
                value={ackOfficer}
                onChange={(e) => setAckOfficer(e.target.value)}
                required
              />
              <Textarea
                label="Remarks (optional)"
                value={ackRemarks}
                onChange={(e) => setAckRemarks(e.target.value)}
                rows={3}
              />
              <Button type="submit" disabled={submitting}>
                Acknowledge receipt
              </Button>
            </form>
          </Card>
        ) : null}

        {canRespond ? (
          <Card
            title="Submit Department Action"
            subtitle="ବିଭାଗ କାର୍ଯ୍ୟ ଦାଖଲ କରନ୍ତୁ"
            className="mt-6"
          >
            <form className="space-y-3" onSubmit={onRespond}>
              <Input
                label="Officer name"
                value={respondOfficer}
                onChange={(e) => setRespondOfficer(e.target.value)}
                required
              />
              <Textarea
                label="Official response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={5}
                required
              />
              <Button type="submit" disabled={submitting}>
                Submit response
              </Button>
            </form>
          </Card>
        ) : null}

        {!canAcknowledge && !canRespond ? (
          <p className="mt-6 text-sm text-text-muted">
            <Bi
              en="No further action is required on this grievance."
              or="ଏହି ଅଭିଯୋଗରେ ଆଉ କୌଣସି କାର୍ଯ୍ୟ ଆବଶ୍ୟକ ନାହିଁ।"
            />
          </p>
        ) : null}
      </main>
    </div>
  );
}
