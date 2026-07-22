"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/admin/form-kit";

/**
 * Admin control for a portfolio card thumbnail. The editor enters the project's
 * live landing-page URL and clicks Capture; the server screenshots the hero and
 * returns a permanent R2 URL, which we hold in a hidden `thumbnail` input and
 * preview inline. The URL itself persists via the hidden `sourceUrl` input.
 */
export function ThumbnailCapture({
  defaultSourceUrl,
  defaultThumbnail,
}: {
  defaultSourceUrl?: string | null;
  defaultThumbnail?: string | null;
}) {
  const [sourceUrl, setSourceUrl] = useState(defaultSourceUrl ?? "");
  const [thumbnail, setThumbnail] = useState(defaultThumbnail ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function capture() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });
      const data = (await res.json()) as { thumbnail?: string; error?: string };
      if (!res.ok || !data.thumbnail) {
        throw new Error(data.error ?? "Could not capture screenshot.");
      }
      setThumbnail(data.thumbnail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Screenshot failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <input type="hidden" name="thumbnail" value={thumbnail} />

      <Field
        label="Landing page URL"
        htmlFor="sourceUrl"
        hint="The project's live site. We screenshot its hero as the card thumbnail."
      >
        <div className="flex gap-2">
          <Input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            placeholder="https://example.com"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={capture}
            disabled={loading || !sourceUrl.trim()}
          >
            {loading ? "Capturing…" : "Capture"}
          </Button>
        </div>
      </Field>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {thumbnail && (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt="Portfolio thumbnail preview"
            className="h-40 w-full rounded-lg border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => setThumbnail("")}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Remove thumbnail
          </button>
        </div>
      )}
    </div>
  );
}
