"use client";

import { useEffect, useState } from "react";

import { apiRequest } from "@/lib/api/client";
import { canManageIntelligence } from "@/lib/auth/roles";
import type { AuthStaff } from "@/types/api";

export function useIntelligenceManage(): { canManage: boolean; loading: boolean } {
  const [canManage, setCanManage] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<AuthStaff>("/api/auth/me")
      .then((res) => {
        const staff = (res as { data?: AuthStaff }).data ?? (res as unknown as AuthStaff);
        setCanManage(canManageIntelligence(staff));
      })
      .catch(() => setCanManage(false))
      .finally(() => setLoading(false));
  }, []);

  return { canManage, loading };
}
