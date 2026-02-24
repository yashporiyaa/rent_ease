import { API_URL } from "./config";

export const createCustomer = async (
  name: string,
  phone1?: string,
  phone2?: string,
  address?: string,
) => {
  try {
    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone1,
        phone2,
        address,
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

export const findCustomerByPhone = async (phone: string) => {
  try {
    const res = await fetch(`${API_URL}/customers/by-phone/${phone}`, {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Find customer by phone failed");
    }

    return data;
  } catch (error) {
    console.error("findCustomerByPhone failed:", error);
    throw error;
  }
};

export const updateCustomer = async (
  id: string,
  payload: { name?: string; phone1?: string; phone2?: string; address?: string },
) => {
  try {
    const res = await fetch(`${API_URL}/customers/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Update customer failed");
    }

    return data;
  } catch (error) {
    console.error("updateCustomer failed:", error);
    throw error;
  }
};

export const getCustomers = async () => {
  try {
    const res = await fetch(`${API_URL}/customers`, {
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
