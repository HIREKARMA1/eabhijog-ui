"use client";

import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { ApiError } from "@/lib/api/client";
import { deletePortalGrievance } from "@/lib/api/portal";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";

type DeleteGrievanceButtonProps = {
  referenceNumber: string;
  filingSource?: "chatbot" | "online_hearing";
  onDeleted?: () => void;
  className?: string;
};

export function DeleteGrievanceButton({
  referenceNumber,
  filingSource,
  onDeleted,
  className,
}: DeleteGrievanceButtonProps) {
  const { t } = useI18n();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy]);

  function close() {
    if (busy) return;
    setOpen(false);
    setError("");
  }

  async function confirmDelete() {
    setBusy(true);
    setError("");
    try {
      await deletePortalGrievance(referenceNumber);
      setOpen(false);
      onDeleted?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("dashboard", "table.deleteFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "gap-1.5 border-danger/20 text-danger hover:border-danger/40 hover:bg-red-50",
          className,
        )}
        aria-label={`${t("dashboard", "table.delete")} ${referenceNumber}`}
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        <Icon name="trash" size={14} />
        {t("dashboard", "table.delete")}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label={t("common", "nav.close")}
            className="absolute inset-0"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-5"
          >
            <h3 id={titleId} className="text-lg font-semibold text-slate-900">
              {t("dashboard", "table.deleteConfirmTitle")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("dashboard", "table.deleteConfirmBody", { ref: referenceNumber })}
            </p>
            {filingSource === "online_hearing" ? (
              <p className="mt-3 rounded-lg border border-danger/20 bg-red-50 px-3 py-2 text-sm text-danger">
                {t("dashboard", "table.deleteConfirmHearing")}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                {t("dashboard", "table.deleteConfirmIrreversible")}
              </p>
            )}
            {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                disabled={busy}
                onClick={close}
              >
                {t("common", "actions.cancel")}
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={busy}
                className="w-full sm:w-auto"
                onClick={() => void confirmDelete()}
              >
                {busy ? t("dashboard", "table.deleting") : t("dashboard", "table.delete")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
