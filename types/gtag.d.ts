/** GA4's global, present only when NEXT_PUBLIC_GA_ID is set (see components/common/analytics.tsx). */
declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js" | "set",
      targetOrName: string | Date,
      params?: Record<string, unknown>
    ) => void;
  }
}

export {};
