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
