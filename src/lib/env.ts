/**
 * Toss App in-app environment detection helper
 */
export function isTossApp(): boolean {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TOSS_APP === 'true') {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const host = window.location.hostname || '';
    if (host.includes('tossmini.com') || host.includes('toss.im')) {
      return true;
    }
  } catch {
    // ignore
  }

  const ua = window.navigator.userAgent || '';
  if (/toss|tossapp|appsintoss|tossbank/i.test(ua)) {
    return true;
  }

  const win = window as any;
  if (win.__AIT__ || win.appsInToss || win.__TOSS__ || win.ReactNativeWebView) {
    return true;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('platform') === 'toss' || params.get('source') === 'toss') {
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}
