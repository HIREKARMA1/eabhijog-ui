"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type BreadcrumbContextValue = {
  breadcrumb: ReactNode;
  setBreadcrumb: (node: ReactNode) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumb, setBreadcrumbState] = useState<ReactNode>(null);
  const setBreadcrumb = useCallback((node: ReactNode) => {
    setBreadcrumbState(node);
  }, []);
  const value = useMemo(
    () => ({ breadcrumb, setBreadcrumb }),
    [breadcrumb, setBreadcrumb],
  );
  return (
    <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
  }
  return ctx;
}

/** Sets the portal topbar breadcrumb for the current page. */
export function SetBreadcrumb({ children }: { children: ReactNode }) {
  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumb(children);
    return () => setBreadcrumb(null);
    // Page remounts on navigation; avoid depending on ReactNode identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBreadcrumb]);
  return null;
}
