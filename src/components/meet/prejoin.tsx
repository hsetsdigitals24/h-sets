"use client";

import * as React from "react";
import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** What the joiner chose on the pre-join screen, passed on to LiveKit. */
export type JoinChoices = {
  audioEnabled: boolean;
  videoEnabled: boolean;
  /** Empty string means "system default device". */
  audioDeviceId: string;
  videoDeviceId: string;
  /** Only set when the pre-join screen asked for a display name. */
  name?: string;
};

/** `useSyncExternalStore` subscription for a value that never changes. */
const subscribeNever = () => () => {};

const STORAGE_KEY = "hsets.meet.prefs";

type StoredPrefs = Pick<
  JoinChoices,
  "audioEnabled" | "videoEnabled" | "audioDeviceId" | "videoDeviceId"
>;

const DEFAULT_PREFS: StoredPrefs = {
  audioEnabled: true,
  videoEnabled: true,
  audioDeviceId: "",
  videoDeviceId: "",
};

function loadPrefs(): StoredPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<StoredPrefs>;
    return {
      audioEnabled: parsed.audioEnabled ?? DEFAULT_PREFS.audioEnabled,
      videoEnabled: parsed.videoEnabled ?? DEFAULT_PREFS.videoEnabled,
      audioDeviceId: parsed.audioDeviceId ?? "",
      videoDeviceId: parsed.videoDeviceId ?? "",
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: StoredPrefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Private mode / storage disabled — preferences just won't be remembered.
  }
}

/**
 * The screen shown before entering any call: a camera preview plus mic and
 * camera on/off toggles and device pickers, so nobody is dropped into a meeting
 * with a hot mic or an unexpected camera. Choices are remembered across calls
 * in localStorage.
 *
 * The preview tracks are stopped as soon as the user joins (and on unmount), so
 * the devices are free for LiveKit to publish.
 */
export function MeetingPreJoin({
  title,
  subtitle,
  joinLabel = "Join call",
  askName = false,
  onJoin,
}: {
  title: string;
  subtitle?: string;
  joinLabel?: string;
  /** Ask the joiner for a display name (shareable guest links). */
  askName?: boolean;
  onJoin: (choices: JoinChoices) => void;
}) {
  // Remembered preferences are read lazily on the client only; rendering is
  // held back until after hydration (`mounted`) so the server pass and the
  // hydration pass produce identical markup.
  const [prefs, setPrefs] = React.useState<StoredPrefs>(loadPrefs);
  const mounted = React.useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
  const [name, setName] = React.useState("");
  const [cameras, setCameras] = React.useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = React.useState<MediaDeviceInfo[]>([]);
  const [deviceError, setDeviceError] = React.useState<string | null>(null);
  const [level, setLevel] = React.useState(0);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  // Mirrors `streamRef` as state, so the level meter below re-attaches when a
  // new preview stream is acquired.
  const [stream, setStream] = React.useState<MediaStream | null>(null);

  const update = React.useCallback((patch: Partial<StoredPrefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      savePrefs(next);
      return next;
    });
  }, []);

  const { audioEnabled, videoEnabled, audioDeviceId, videoDeviceId } = prefs;

  // Acquire (and re-acquire) the preview stream whenever a toggle or device
  // selection changes. Both kinds live on one stream so there is a single
  // teardown path.
  React.useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    const stop = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    };

    (async () => {
      stop();
      if (!audioEnabled && !videoEnabled) {
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }
      try {
        const preview = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled
            ? videoDeviceId
              ? { deviceId: { exact: videoDeviceId } }
              : true
            : false,
          audio: audioEnabled
            ? audioDeviceId
              ? { deviceId: { exact: audioDeviceId } }
              : true
            : false,
        });
        if (cancelled) {
          preview.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = preview;
        setStream(preview);
        setDeviceError(null);
        if (videoRef.current) videoRef.current.srcObject = preview;
        // Labels are only exposed once permission has been granted, so list
        // devices after acquiring the stream.
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        setCameras(devices.filter((d) => d.kind === "videoinput"));
        setMics(devices.filter((d) => d.kind === "audioinput"));
      } catch {
        if (!cancelled) {
          setDeviceError(
            "We couldn't access your camera or microphone. Check your browser permissions — you can still join without them."
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [mounted, audioEnabled, videoEnabled, audioDeviceId, videoDeviceId]);

  // Live mic level, so the joiner can confirm the right microphone is picked up.
  React.useEffect(() => {
    if (!mounted || !audioEnabled || !stream || stream.getAudioTracks().length === 0) {
      return;
    }
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (const value of data) peak = Math.max(peak, Math.abs(value - 128) / 128);
      setLevel(peak);
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      void context.close();
    };
  }, [mounted, audioEnabled, stream]);

  const join = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    onJoin({ ...prefs, ...(askName ? { name: name.trim() } : {}) });
  };

  const canJoin = !askName || name.trim().length > 0;

  // Nothing device-dependent is rendered until after hydration, so the markup
  // can safely reflect remembered preferences from here on.
  if (!mounted) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="text-center">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {subtitle ?? "Check your camera and microphone before joining."}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-start">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "size-full object-cover [transform:scaleX(-1)]",
                !videoEnabled && "hidden"
              )}
            />
            {!videoEnabled && (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <VideoOff className="size-8" />
                <p className="text-sm">Camera is off</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
              <ToggleButton
                on={audioEnabled}
                onClick={() => update({ audioEnabled: !audioEnabled })}
                label={audioEnabled ? "Turn off microphone" : "Turn on microphone"}
                OnIcon={Mic}
                OffIcon={MicOff}
              />
              <ToggleButton
                on={videoEnabled}
                onClick={() => update({ videoEnabled: !videoEnabled })}
                label={videoEnabled ? "Turn off camera" : "Turn on camera"}
                OnIcon={Video}
                OffIcon={VideoOff}
              />
            </div>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              join();
            }}
          >
            {askName && (
              <div className="space-y-1.5">
                <Label htmlFor="prejoin-name">Your name</Label>
                <Input
                  id="prejoin-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ada Obi"
                  maxLength={60}
                  autoFocus
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="prejoin-mic">Microphone</Label>
              <Select
                id="prejoin-mic"
                value={audioDeviceId}
                disabled={!audioEnabled}
                onChange={(e) => update({ audioDeviceId: e.target.value })}
              >
                <option value="">Default microphone</option>
                {mics.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${index + 1}`}
                  </option>
                ))}
              </Select>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                aria-hidden
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-75"
                  style={{
                    // The meter is stale while the mic is off — pin it to zero.
                    width: audioEnabled
                      ? `${Math.min(100, Math.round(level * 140))}%`
                      : 0,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prejoin-camera">Camera</Label>
              <Select
                id="prejoin-camera"
                value={videoDeviceId}
                disabled={!videoEnabled}
                onChange={(e) => update({ videoDeviceId: e.target.value })}
              >
                <option value="">Default camera</option>
                {cameras.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </Select>
            </div>

            {deviceError && (
              <p className="text-sm text-muted-foreground">{deviceError}</p>
            )}

            <Button type="submit" className="w-full" disabled={!canJoin}>
              {joinLabel}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Joining with your microphone {audioEnabled ? "on" : "off"} and camera{" "}
              {videoEnabled ? "on" : "off"}. You can change this during the call.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function ToggleButton({
  on,
  onClick,
  label,
  OnIcon,
  OffIcon,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  OnIcon: React.ComponentType<{ className?: string }>;
  OffIcon: React.ComponentType<{ className?: string }>;
}) {
  const Icon = on ? OnIcon : OffIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      title={label}
      className={cn(
        "flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        on
          ? "border-border bg-background/90 text-foreground hover:bg-background"
          : "border-destructive bg-destructive text-white hover:bg-destructive/90"
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
