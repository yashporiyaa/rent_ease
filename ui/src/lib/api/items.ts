import { API_URL } from "./config";

export const createItem = async (
  shortName: string,
  fullName: string,
  categoryId: string,
  description: string | undefined,
  sizeId: string,
  price: number,
  entryDate: string,
  quantity: number,
  images: string[],
) => {
  try {
    const res = await fetch(`${API_URL}/items`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shortName,
        fullName,
        categoryId,
        description,
        sizeId,
        price: Number(price),
        entryDate,
        quantity: Number(quantity),
        images,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Create item failed");
    }

    return res.json();
  } catch (error) {
    console.error("createItem failed:", error);
    throw error;
  }
};

export const getItems = async () => {
  try {
    const res = await fetch(`${API_URL}/items`, {
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

export const updateItem = async (
  id: string,
  payload: {
    shortName?: string;
    fullName?: string;
    categoryId?: string;
    description?: string;
    sizeId?: string;
    price?: number;
    entryDate?: string;
    quantity?: number;
    images?: string[];
  },
) => {
  try {
    const res = await fetch(`${API_URL}/items/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Update item failed");
    }

    return data;
  } catch (error) {
    console.error("updateItem failed:", error);
    throw error;
  }
};

export const deleteItem = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/items/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Delete item failed");
    }

    return data;
  } catch (error) {
    console.error("deleteItem failed:", error);
    throw error;
  }
};

export const getAvailability = async (startDate: string, endDate: string) => {
  try {
    const params = new URLSearchParams({ startDate, endDate });
    const res = await fetch(
      `${API_URL}/items/availability?${params.toString()}`,
      {
        credentials: "include",
      },
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch availability failed");
    }

    return data;
  } catch (error) {
    console.error("getAvailability failed:", error);
    throw error;
  }
};
