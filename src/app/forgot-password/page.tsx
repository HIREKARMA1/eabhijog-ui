"use client";

import { SimpleAuthForm } from "@/components/auth/AuthFormLayout";
import { forgotPassword } from "@/lib/api/portal";

export default function ForgotPasswordPage() {
  return (
    <SimpleAuthForm
      titleKey="forgotPassword.title"
      subtitleKey="forgotPassword.subtitle"
      submitKey="forgotPassword.submit"
      successKey="forgotPassword.success"
      fields={[{ name: "email", labelKey: "forgotPassword.email", type: "email" }]}
      onSubmit={async (values) => {
        await forgotPassword(values.email);
      }}
    />
  );
}
