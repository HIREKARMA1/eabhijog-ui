"use client";



import { FormEvent, useState } from "react";

import { useRouter } from "next/navigation";



import { Button } from "@/components/ui/Button";

import { Card } from "@/components/ui/Card";

import { GrievanceAttachments } from "@/components/grievance/GrievanceAttachments";

import { Input } from "@/components/ui/Input";

import { Select } from "@/components/ui/Select";

import { Textarea } from "@/components/ui/Textarea";

import { forwardOsdGrievance, updateOsdStatus } from "@/lib/api/portal";

import { ApiError } from "@/lib/api/client";

import { useI18n } from "@/lib/i18n/context";

import type { GrievanceRow, OsdDepartmentContact } from "@/types/api";



type OsdGrievanceDetailProps = {

  osdSlug: string;

  grievance: GrievanceRow;

  allowedStatuses: string[];

  priorities: string[];

  suggestedRecipients: OsdDepartmentContact[];

  timeline: Array<{ title: string; description: string; created_at: string }>;

};



export function OsdGrievanceDetailView({

  osdSlug,

  grievance,

  allowedStatuses,

  priorities,

  suggestedRecipients,

  timeline,

}: OsdGrievanceDetailProps) {

  const { t } = useI18n();

  const router = useRouter();

  const [status, setStatus] = useState(grievance.status);

  const [priority, setPriority] = useState(grievance.priority ?? "normal");

  const [remarks, setRemarks] = useState("");

  const [selectedIndex, setSelectedIndex] = useState(0);

  const initialContact = suggestedRecipients[0];

  const [dept, setDept] = useState(initialContact?.department ?? "");

  const [officerName, setOfficerName] = useState(initialContact?.officer_name ?? "");

  const [officerEmail, setOfficerEmail] = useState(initialContact?.email ?? "");

  const [message, setMessage] = useState("");



  function onDepartmentChange(index: number) {

    setSelectedIndex(index);

    const contact = suggestedRecipients[index];

    if (!contact) return;

    setDept(contact.department);

    setOfficerName(contact.officer_name);

    setOfficerEmail(contact.email);

  }



  async function onStatusSubmit(e: FormEvent) {

    e.preventDefault();

    setMessage("");

    try {

      await updateOsdStatus(osdSlug, grievance.reference_number, { status, priority, remarks });

      router.refresh();

      setMessage("Status updated.");

    } catch (err) {

      setMessage(err instanceof ApiError ? err.message : t("common", "errors.generic"));

    }

  }



  async function onForwardSubmit(e: FormEvent) {

    e.preventDefault();

    setMessage("");

    try {

      await forwardOsdGrievance(osdSlug, grievance.reference_number, {

        remarks,

        recipients: [{ department: dept, officer_name: officerName, email: officerEmail }],

      });

      router.refresh();

      setMessage("Forwarded.");

    } catch (err) {

      setMessage(err instanceof ApiError ? err.message : t("common", "errors.generic"));

    }

  }



  return (

    <div className="grid gap-5 lg:grid-cols-3">

      <Card title={grievance.reference_number} className="lg:col-span-2">

        <dl className="grid gap-3 text-sm sm:grid-cols-2">

          <div>

            <dt className="text-text-muted">Citizen</dt>

            <dd>{grievance.citizen_name ?? "—"}</dd>

          </div>

          <div>

            <dt className="text-text-muted">{t("dashboard", "table.district")}</dt>

            <dd>{grievance.geographic_district ?? grievance.district ?? "—"}</dd>

          </div>

          <div className="sm:col-span-2">

            <dt className="text-text-muted">Grievance</dt>

            <dd className="mt-1 whitespace-pre-wrap">{grievance.grievance_text ?? grievance.title}</dd>

          </div>

        </dl>

        <div className="mt-5 border-t border-border pt-5">

          <GrievanceAttachments

            attachments={grievance.attachments}

            attachmentUrl={grievance.attachment_url}

          />

        </div>

      </Card>



      <Card title={t("dashboard", "grievance.updateStatus")}>

        <form onSubmit={onStatusSubmit} className="space-y-3">

          <Select

            label={t("dashboard", "table.status")}

            value={status}

            onChange={(e) => setStatus(e.target.value)}

            options={allowedStatuses.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}

          />

          <Select

            label={t("dashboard", "grievance.priority")}

            value={priority}

            onChange={(e) => setPriority(e.target.value)}

            options={priorities.map((p) => ({ value: p, label: p }))}

          />

          <Textarea label={t("dashboard", "grievance.remarks")} value={remarks} onChange={(e) => setRemarks(e.target.value)} />

          <Button type="submit" className="w-full">{t("dashboard", "grievance.updateStatus")}</Button>

        </form>

      </Card>



      <Card title={t("dashboard", "grievance.forward")} className="lg:col-span-3">

        <form onSubmit={onForwardSubmit} className="grid gap-3 md:grid-cols-3">

          {suggestedRecipients.length > 0 ? (
          <Select

            label={t("dashboard", "departments.department")}

            value={String(selectedIndex)}

            onChange={(e) => onDepartmentChange(Number(e.target.value))}

            options={suggestedRecipients.map((contact, index) => ({

              value: String(index),

              label: contact.department,

            }))}

          />
          ) : (
          <Input
            label={t("dashboard", "departments.department")}
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            required
          />
          )}

          <Input

            label={t("dashboard", "departments.officerName")}

            value={officerName}

            onChange={(e) => setOfficerName(e.target.value)}

            required

          />

          <Input

            label={t("dashboard", "departments.email")}

            type="email"

            value={officerEmail}

            onChange={(e) => setOfficerEmail(e.target.value)}

            required

          />

          <div className="md:col-span-3">

            <Textarea label={t("dashboard", "grievance.remarks")} value={remarks} onChange={(e) => setRemarks(e.target.value)} />

          </div>

          <Button type="submit">{t("dashboard", "grievance.forward")}</Button>

        </form>

        {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}

      </Card>



      <Card title={t("dashboard", "grievance.timeline")} className="lg:col-span-3">

        <ul className="space-y-3">

          {timeline.map((event, idx) => (

            <li key={idx} className="border-l-2 border-border pl-4">

              <p className="font-semibold">{event.title}</p>

              <p className="text-sm text-text-muted">{event.description}</p>

            </li>

          ))}

        </ul>

      </Card>

    </div>

  );

}

