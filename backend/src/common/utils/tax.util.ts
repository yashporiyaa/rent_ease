export function calculateTax(
  subtotal: number,
  taxRate?: number | null,
) {
  if (!taxRate || taxRate <= 0) {
    return {
      taxAmount: 0,
      grandTotal: subtotal,
    };
  }

  const taxAmount = Number(
    ((subtotal * taxRate) / 100).toFixed(2),
  );

  const grandTotal = Number(
    (subtotal + taxAmount).toFixed(2),
  );

  return {
    taxAmount,
    grandTotal,
  };
}
