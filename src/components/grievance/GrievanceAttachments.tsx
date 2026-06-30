import { Bi } from "@/lib/i18n/bi";
import {
  attachmentFileName,
  attachmentPublicUrl,
  isViewableAttachmentPath,
} from "@/lib/media/attachment-url";
import type { GrievanceAttachment } from "@/types/api";

type GrievanceAttachmentsProps = {
  attachments?: GrievanceAttachment[];
  attachmentUrl?: string | null;
};

export function GrievanceAttachments({
  attachments = [],
  attachmentUrl,
}: GrievanceAttachmentsProps) {
  let visible = attachments.filter((att) => isViewableAttachmentPath(att.file_path));

  if (
    visible.length === 0 &&
    attachmentUrl &&
    isViewableAttachmentPath(attachmentUrl) &&
    !visible.some((att) => att.file_path === attachmentUrl)
  ) {
    visible = [
      {
        id: 0,
        file_path: attachmentUrl,
        mime_type: attachmentUrl.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg",
        file_size: 0,
        created_at: "",
      },
    ];
  }

  if (visible.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        <Bi en="No attachments submitted." or="କୌଣସି ସଂଲଗ୍ନ ଦାଖଲ ହୋଇନାହିଁ।" />
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
        <Bi en="Citizen attachments" or="ନାଗରିକ ସଂଲଗ୍ନ" />
      </h3>
      <ul className="space-y-4">
        {visible.map((att) => {
          const href = attachmentPublicUrl(att.file_path);
          const name = attachmentFileName(att.file_path);
          const isImage = att.mime_type?.startsWith("image/");
          const isVideo = att.mime_type?.startsWith("video/");
          const isPdf = att.mime_type === "application/pdf";

          return (
            <li key={att.id} className="rounded-lg border border-border bg-white p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                <span aria-hidden="true">{isVideo ? "🎬" : isPdf ? "📄" : "🖼"}</span>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-800 hover:underline"
                >
                  {name}
                </a>
                {att.mime_type ? (
                  <span className="text-xs text-gray-400">({att.mime_type})</span>
                ) : null}
              </div>
              {isImage ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={href}
                    alt={name}
                    className="max-h-80 max-w-full rounded-md border border-border object-contain"
                  />
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
