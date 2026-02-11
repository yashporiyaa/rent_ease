export const createItem = async (
  name: string,
  category: string,
  price: number,
) => {
  try {
    const res = await fetch("http://localhost:3001/items", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        price: Number(price),
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
