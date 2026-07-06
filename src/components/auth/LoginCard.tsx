import type { ReactNode } from "react";

type LoginCardProps = {
  children: ReactNode;
};

export function LoginCard({ children }: LoginCardProps) {
  return (
    <div className="auth-login-card-wrap w-full">
      <span className="auth-login-card-accent auth-login-card-accent-tl" aria-hidden="true" />
      <span className="auth-login-card-accent auth-login-card-accent-br" aria-hidden="true" />
      <div className="auth-login-card">{children}</div>
    </div>
  );
}
