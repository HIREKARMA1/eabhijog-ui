"use client";

import { SimpleAuthForm } from "@/components/auth/AuthFormLayout";
import { requestAccess } from "@/lib/api/portal";

export default function RequestAccessPage() {
  return (
    <SimpleAuthForm
      titleKey="requestAccess.title"
      subtitleKey="requestAccess.subtitle"
      submitKey="requestAccess.submit"
      successKey="requestAccess.success"
      fields={[
        { name: "name", labelKey: "requestAccess.name" },
        { name: "email", labelKey: "requestAccess.email", type: "email" },
        { name: "designation", labelKey: "requestAccess.designation" },
        { name: "district", labelKey: "requestAccess.district" },
        { name: "phone", labelKey: "requestAccess.phone" },
        { name: "message", labelKey: "requestAccess.message" },
      ]}
      onSubmit={async (values) => {
        await requestAccess(values);
      }}
    />
  );
}
