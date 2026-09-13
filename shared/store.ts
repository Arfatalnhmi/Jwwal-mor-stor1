export type PricedLine = { price: number; quantity: number };

export function formatSar(value: number): string {
  return `${value.toLocaleString("ar-SA")} ر.س`;
}

export function calculateOrderTotal(lines: PricedLine[], vatRate = 0.15): {
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
} {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const vat = subtotal * vatRate;
  const shipping = subtotal > 0 && subtotal < 299 ? 29 : 0;
  return { subtotal, vat, shipping, total: subtotal + vat + shipping };
}
