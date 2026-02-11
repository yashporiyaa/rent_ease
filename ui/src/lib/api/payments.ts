export const createPayment = async (
  invoiceId: string,
  amount: number,
  method: string,
  reference?: string,
  paidAt?: string,
) => {
  try {
    const res = await fetch("http://localhost:3001/payments", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceId,
        amount: Number(amount),
        method,
        reference: reference || null,
        paidAt,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Create payment failed");
    }

    return data;
  } catch (error) {
    console.error("createPayment failed:", error);
    throw error;
  }
};
