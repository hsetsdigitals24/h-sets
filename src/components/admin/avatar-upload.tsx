"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MAX_AVATAR_BYTES } from "@/lib/avatar";

/**
 * Picks a profile picture, posts it to /api/admin/profile/avatar where it is
 * stored as a blob in Postgres, and exposes the URL that serves it back as a
 * hidden input so the surrounding <form> persists it on save. The preview
 * updates as soon as the upload finishes; nothing is written to the account
 * until the form is submitted, and "Remove" simply clears the field.
 */
export function AvatarUpload({
  name,
  defaultUrl,
}: {
  name: string;
  defaultUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);

  async function onPick(file: File) {
    // Checked again on the server; catching it here saves sending the bytes.
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Profile picture must be 5 MB or smaller.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/profile/avatar", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!res.ok || !data?.url) {
        throw new Error(data?.error ?? `Upload failed (${res.status})`);
      }
      setUrl(data.url);
      toast.success("Picture uploaded — save to apply it");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      // Allow re-picking the same file after a failed attempt.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={url || null} name={name} size={80} className="border border-border" />
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <UploadCloud className="size-4" /> {url ? "Change picture" : "Upload picture"}
              </>
            )}
          </Button>
          {url && !uploading && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setUrl("")}>
              <Trash2 className="size-4" /> Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP up to 5 MB. Shown in the admin header and as your
          avatar in video calls.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
        }}
      />
      <input type="hidden" name="image" value={url} />
    </div>
  );
}
