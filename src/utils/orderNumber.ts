/** ORD-YYYYMMDD-XXXXXX (6 dígitos aleatorios). Unicidad reforzada a nivel de
 * BD (columna única); el service reintenta si hay colisión (ver §createOrder). */
export function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${datePart}-${randomPart}`;
}
