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

export const getAvailability = async (startDate: string, endDate: string) => {
  try {
    const params = new URLSearchParams({ startDate, endDate });
    const res = await fetch(
      `http://localhost:3001/items/availability?${params.toString()}`,
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
