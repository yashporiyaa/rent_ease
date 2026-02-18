export const createCheckoutSession = async () => {
  try {
    const res = await fetch("http://localhost:3001/stripe/create-checkout-session", {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Create checkout session failed");
    }

    const checkoutUrl = data?.data?.url as string | undefined;
    if (!checkoutUrl) {
      throw new Error("Checkout URL missing in response");
    }

    return checkoutUrl;
  } catch (error) {
    console.error("createCheckoutSession failed:", error);
    throw error;
  }
};
