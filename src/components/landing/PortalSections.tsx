"use client";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/context";
import type { PortalDepartment, PortalGrievancePreview } from "@/types/api";

type PortalSectionsProps = {
  departments: PortalDepartment[];
  recent: PortalGrievancePreview[];
};

export function PortalSections({ departments, recent }: PortalSectionsProps) {
  const { t } = useI18n();

  return (
    <section id="departments" className="py-14">
      <div className="mx-auto max-w-[1120px] space-y-8 px-5">
        <Card title={t("landing", "sections.departments")}>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <li
                key={dept.slug}
                className="rounded-lg border border-border bg-surface px-4 py-3 text-sm"
              >
                <p className="font-semibold text-slate-900">{dept.name}</p>
                <p className="mt-1 text-text-muted">
                  {dept.count} total · {dept.open_count} open
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t("landing", "sections.recentCases")}>
          <ul className="divide-y divide-border">
            {recent.map((item) => (
              <li key={item.reference_number} className="flex flex-wrap gap-2 py-3 text-sm">
                <span className="font-semibold text-navy-700">{item.reference_number}</span>
                <span className="text-text-muted">{item.district}</span>
                <span className="text-text-muted">{item.category}</span>
                <span className="ml-auto font-medium">{item.status_label}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
