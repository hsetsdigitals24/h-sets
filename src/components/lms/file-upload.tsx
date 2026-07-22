"use client";

import { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

/** Result of asking the server for a presigned upload URL. */
export type PresignResult = { url: string; key: string } | { error: string };

/**
 * Drag/pick a file, upload it directly to R2 via a presigned PUT URL obtained
 * from `getUploadUrl`, then expose the resulting object key + filename as hidden
 * inputs so the surrounding <form> can persist them on submit.
 *
 * `getUploadUrl` is a server action (bound per context so it can enforce the
 * right role/ownership guard).
 */
export function FileUpload({
  getUploadUrl,
  keyName = "r2Key",
  fileNameField = "fileName",
  accept,
  required,
}: {
  getUploadUrl: (filename: string, contentType: string) => Promise<PresignResult>;
  keyName?: string;
  fileNameField?: string;
  accept?: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");
  const [uploaded, setUploaded] = useState<{ key: string; name: string } | null>(null);

  async function onPick(file: File) {
    setStatus("uploading");
    try {
      const presigned = await getUploadUrl(file.name, file.type || "application/octet-stream");
      if ("error" in presigned) {
        toast.error(presigned.error);
        setStatus("idle");
        return;
      }
      const res = await fetch(presigned.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      setUploaded({ key: presigned.key, name: file.name });
      setStatus("done");
      toast.success("File uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-background px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground disabled:opacity-60"
      >
        {status === "uploading" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Uploading…
          </>
        ) : status === "done" ? (
          <>
            <CheckCircle2 className="size-4 text-emerald-600" />
            {uploaded?.name}
          </>
        ) : (
          <>
            <UploadCloud className="size-4" /> Choose a file to upload
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
        }}
      />
      {uploaded && (
        <>
          <input type="hidden" name={keyName} value={uploaded.key} />
          <input type="hidden" name={fileNameField} value={uploaded.name} />
        </>
      )}
      {required && !uploaded && (
        <input
          type="text"
          required
          value=""
          onChange={() => {}}
          className="sr-only"
          aria-hidden
          tabIndex={-1}
        />
      )}
    </div>
  );
}
