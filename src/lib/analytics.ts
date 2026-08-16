/**
 * Envio de eventos.
 *
 * O projeto ainda não tem ferramenta de analytics instalada e o pedido é
 * explícito para não instalar uma segunda. Então isto é só uma ponte: entrega
 * para gtag/dataLayer se algum dia existirem, e vira no-op enquanto não
 * existirem. Zero dependência, zero bytes de terceiro.
 */

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: EventParams) => void;
    dataLayer?: unknown[];
  }
}

export type StockEvent =
  | "stock_search"
  | "stock_filter"
  | "stock_item_open"
  | "stock_gallery_open"
  | "stock_contact_click";

export function trackEvent(name: StockEvent, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", name, params);
    window.dataLayer?.push({ event: name, ...params });
  } catch {
    // Analytics nunca pode derrubar a navegação.
  }
}
