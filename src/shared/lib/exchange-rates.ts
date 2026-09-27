/**
 * Display exchange rates (1 INR = rate units), loaded from the backend
 * (/api/v1/settings/exchange-rates) by RegionalSettingsProvider.
 *
 * Until they arrive, only INR is known; prices then render in INR rather than with a guessed rate.
 */
let rates: Record<string, number> = { INR: 1 };
const listeners = new Set<() => void>();

export function setExchangeRates(next: Record<string, number>) {
  rates = { ...next, INR: 1 };
  listeners.forEach((listener) => listener());
}

/** Rate from INR to the currency, or undefined when it is not known yet. */
export function rateFromInr(code: string): number | undefined {
  return rates[code];
}

export function subscribeExchangeRates(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getExchangeRatesSnapshot() {
  return rates;
}
