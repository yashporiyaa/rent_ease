export const getInvoice = async (invoiceId: string) => {
  try {
    const res = await fetch(`http://localhost:3001/invoices/${invoiceId}`, {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch invoice failed");
    }

    return data;
  } catch (error) {
    console.error("getInvoice failed:", error);
    throw error;
  }
};

export const getAllInvoices = async () => {
  try {
    const res = await fetch("http://localhost:3001/invoices", {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch invoices failed");
    }

    return data;
  } catch (error) {
    console.error("getAllInvoices failed:", error);
    throw error;
  }
};

export const downloadInvoicePDF = async (invoice: { id: string }) => {
  const newWindow = await window.open(
    `http://localhost:3001/invoices/${invoice.id}/pdf`,
    "_blank",
  );

  if (!newWindow) {
    throw new Error("Failed to open PDF");
  }
};
