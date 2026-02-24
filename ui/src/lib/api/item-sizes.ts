import { API_URL } from "./config";

export type ItemSizePayload = {
  name: string;
};

export const getItemSizes = async () => {
  try {
    const res = await fetch(`${API_URL}/item-sizes`, {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch sizes failed");
    }

    return data;
  } catch (error) {
    console.error("getItemSizes failed:", error);
    throw error;
  }
};

export const createItemSize = async (payload: ItemSizePayload) => {
  try {
    const res = await fetch(`${API_URL}/item-sizes`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Create size failed");
    }

    return data;
  } catch (error) {
    console.error("createItemSize failed:", error);
    throw error;
  }
};

export const updateItemSize = async (id: string, payload: ItemSizePayload) => {
  try {
    const res = await fetch(`${API_URL}/item-sizes/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Update size failed");
    }

    return data;
  } catch (error) {
    console.error("updateItemSize failed:", error);
    throw error;
  }
};

export const deleteItemSize = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/item-sizes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Delete size failed");
    }

    return data;
  } catch (error) {
    console.error("deleteItemSize failed:", error);
    throw error;
  }
};
