export const API_URL = process.env.BASE_URL || "http://localhost:3001";

export const createUser = async (createUsersData: {
  companyName: string;
  phone: string;
  email: string;
  businessType: string;
  password: string;
}) => {
    console.log(createUsersData);
  try {
    const response = await fetch(`${API_URL}/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createUsersData),
    });

    const data = await response.json();
    console.log(response);
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data?.data || [];
  } catch (error) {
    console.error("Error while creating user:", error);
    throw error;
  }
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const res = await fetch("http://localhost:3001/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  return res.json();
};

