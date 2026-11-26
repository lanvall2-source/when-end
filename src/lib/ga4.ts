declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initializedId: string | null = null;
let lastPath: string | null = null;

export function initGA4(measurementId?: string) {
  const id =
    measurementId ??
    ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_GA_MEASUREMENT_ID);
  if (!id || typeof window === 'undefined' || initializedId === id) return;

  try {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: true });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);

    initializedId = id;
  } catch {
    // Tracking must never interrupt app startup.
  }
}

export function trackPageView(pathname: string) {
  if (typeof window === 'undefined' || !initializedId || pathname === lastPath) return;
  try {
    window.gtag?.('event', 'page_view', {
      page_location: window.location.href,
      page_path: pathname,
      page_title: document.title,
    });
    lastPath = pathname;
  } catch {
    // Tracking must never interrupt navigation.
  }
}
