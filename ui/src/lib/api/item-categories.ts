export type ItemCategoryPayload = {
  name: string;
  imageUrl?: string;
};

export const getItemCategories = async () => {
  try {
    const res = await fetch("http://localhost:3001/item-categories", {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Fetch categories failed");
    }

    return data;
  } catch (error) {
    console.error("getItemCategories failed:", error);
    throw error;
  }
};

export const createItemCategory = async (payload: ItemCategoryPayload) => {
  try {
    const res = await fetch("http://localhost:3001/item-categories", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Create category failed");
    }

    return data;
  } catch (error) {
    console.error("createItemCategory failed:", error);
    throw error;
  }
};

export const updateItemCategory = async (
  id: string,
  payload: ItemCategoryPayload,
) => {
  try {
    const res = await fetch(`http://localhost:3001/item-categories/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Update category failed");
    }

    return data;
  } catch (error) {
    console.error("updateItemCategory failed:", error);
    throw error;
  }
};

export const deleteItemCategory = async (id: string) => {
  try {
    const res = await fetch(`http://localhost:3001/item-categories/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Delete category failed");
    }

    return data;
  } catch (error) {
    console.error("deleteItemCategory failed:", error);
    throw error;
  }
};
