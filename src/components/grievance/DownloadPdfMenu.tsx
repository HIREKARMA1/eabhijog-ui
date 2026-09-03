"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";

type DownloadPdfMenuProps = {
  onDownload: () => void;
  loading?: boolean;
  size?: "sm" | "md";
  variant?: "primary" | "ghost";
  iconOnly?: boolean;
  className?: string;
};

export function DownloadPdfMenu({
  onDownload,
  loading = false,
  size = "sm",
  variant = "primary",
  iconOnly = false,
  className,
}: DownloadPdfMenuProps) {
  const { t } = useI18n();

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      loading={loading}
      aria-label={t("dashboard", "table.download")}
      title={t("dashboard", "table.downloadAsFilledHint")}
      onClick={onDownload}
      className={cn(iconOnly ? "px-2" : "gap-1.5", className)}
    >
      {loading ? null : <Icon name="download" size={iconOnly ? 16 : 14} />}
      {iconOnly || loading ? null : t("dashboard", "table.download")}
    </Button>
  );
}
