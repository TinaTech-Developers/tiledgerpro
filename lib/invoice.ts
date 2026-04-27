export function generateInvoiceNumber(lastNumber: number) {
  return `INV-${String(lastNumber + 1).padStart(5, "0")}`;
}
