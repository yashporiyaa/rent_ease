import { API_URL } from "./config";

export const downloadInvoicePDF = async (invoice: { id: string }) => {
  const newWindow = await window.open(
    `${API_URL}/invoices/${invoice.id}/pdf`,
    "_blank",
  );

  if (!newWindow) {
    throw new Error("Failed to open PDF");
  }
};
