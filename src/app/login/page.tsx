import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/api/server-portal";
import { homePathFor } from "@/lib/auth/roles";

export default async function LoginPage() {
  try {
    const staff = await getCurrentUser();
    redirect(homePathFor(staff));
  } catch {
    // Session missing or expired - show login form.
  }

  // No client LoginAuthGuard: when RSC session checks fail transiently, a client
  // /me success would bounce back to OSD and recreate a login ↔ dashboard loop.
  return <LoginForm />;
}
