"use client";

import { SimpleAuthForm } from "@/components/auth/AuthFormLayout";
import { requestDemo } from "@/lib/api/portal";

export default function RequestDemoPage() {
  return (
    <SimpleAuthForm
      titleKey="requestDemo.title"
      subtitleKey="requestDemo.subtitle"
      submitKey="requestDemo.submit"
      successKey="requestDemo.success"
      fields={[
        { name: "name", labelKey: "requestDemo.name" },
        { name: "email", labelKey: "requestDemo.email", type: "email" },
        { name: "department", labelKey: "requestDemo.department" },
        { name: "district", labelKey: "requestDemo.district" },
        { name: "phone", labelKey: "requestDemo.phone" },
        { name: "message", labelKey: "requestDemo.message" },
      ]}
      onSubmit={async (values) => {
        await requestDemo(values);
      }}
    />
  );
}
