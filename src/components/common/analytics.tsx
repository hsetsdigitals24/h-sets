import Script from "next/script";

/**
 * GA4. Renders nothing unless NEXT_PUBLIC_GA_ID is set, so local and preview
 * environments never pollute the production property. `afterInteractive` keeps
 * the tag off the critical path — the audit's ≥90 mobile Lighthouse target
 * leaves no budget for a render-blocking third-party script.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
