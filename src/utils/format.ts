const CURRENCY_LOCALE: Record<string, string> = {
  inr: "en-IN",
  usd: "en-US",
  gbp: "en-GB",
  eur: "de-DE",
};

export function formatMoney(amount: number, currency = "inr") {
  const locale = CURRENCY_LOCALE[currency.toLowerCase()] ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(timestamp: number | { toMillis?: () => number } | undefined) {
  if (!timestamp) return "";
  const millis =
    typeof timestamp === "number"
      ? timestamp
      : typeof timestamp.toMillis === "function"
        ? timestamp.toMillis()
        : Date.now();
  return new Date(millis).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
