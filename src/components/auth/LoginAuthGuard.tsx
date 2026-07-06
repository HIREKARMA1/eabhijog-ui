"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/ui/Spinner";
import { fetchCurrentUser } from "@/lib/api/portal";
import { homePathFor } from "@/lib/auth/roles";

type LoginAuthGuardProps = {
  children: ReactNode;
};

export function LoginAuthGuard({ children }: LoginAuthGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const result = await fetchCurrentUser();
        if (!cancelled) {
          router.replace(homePathFor(result.data));
        }
      } catch {
        if (!cancelled) {
          setAllowed(true);
        }
      }
    }

    void verifySession();

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        setAllowed(false);
        void verifySession();
      }
    }

    window.addEventListener("pageshow", onPageShow);
    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <>{children}</>;
}
