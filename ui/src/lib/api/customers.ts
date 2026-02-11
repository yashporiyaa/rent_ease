export const createCustomer = async (name: string, phone?: string) => {
  try {
    const res = await fetch("http://localhost:3001/customers", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Create customer failed");
    }

    return res.json();
  } catch (error) {
    console.error("createCustomer failed:", error);
    throw error;
  }
};

export const getCustomers = async () => {
  try {
    const res = await fetch("http://localhost:3001/customers", {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch customers failed");
    }

    return data;
  } catch (error) {
    console.error("getCustomers failed:", error);
    throw error;
  }
};

export const getItems = async () => {
  try {
    const res = await fetch("http://localhost:3001/items", {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch items failed");
    }

    return data;
  } catch (error) {
    console.error("getItems failed:", error);
    throw error;
  }
};
