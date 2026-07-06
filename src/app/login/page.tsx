import { redirect } from "next/navigation";

import { LoginAuthGuard } from "@/components/auth/LoginAuthGuard";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/api/server-portal";
import { homePathFor } from "@/lib/auth/roles";

export default async function LoginPage() {
  try {
    const staff = await getCurrentUser();
    redirect(homePathFor(staff));
  } catch {
    // Session missing or expired — show login form.
  }

  return (
    <LoginAuthGuard>
      <LoginForm />
    </LoginAuthGuard>
  );
}
