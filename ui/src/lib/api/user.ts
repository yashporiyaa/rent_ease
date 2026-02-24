import { API_URL } from "./config";

export const createUser = async (createUsersData: {
  companyName: string;
  phone: string;
  email: string;
  businessType: string;
  password: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/users/signup`, {
      method: "POST",
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createUsersData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data?.data || [];
  } catch (error) {
    console.error("Error while creating user:", error);
    throw error;
  }
};

export const loginUser = async (data: { email: string; password: string }) => {
  try {
    const res = await fetch(`${API_URL}/users/login`, {
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
  } catch (error) {
    console.error("loginUser failed:", error);
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const res = await fetch(`${API_URL}/users/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Forgot password failed");
    }

    return res.json();
  } catch (error) {
    console.error("forgotPassword failed:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const res = await fetch(`${API_URL}/users/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Logout failed");
    }

    return res.json();
  } catch (error) {
    console.error("logoutUser failed:", error);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const res = await fetch(`${API_URL}/users/me`, {
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Fetch user failed");
    }

    return res.json();
  } catch (error) {
    console.error("getUser failed:", error);
    throw error;
  }
};

export const getUserDashboardData = async () => {
  try {
    const res = await fetch(`${API_URL}/users/dashboard`, {
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Fetch user dashboard data failed");
    }

    return res.json();
  } catch (error) {
    console.error("getUserDashbaordData failed:", error);
    throw error;
  }
};

export const updateUserTaxSettings = async (taxRate: string) => {
  try {
    const res = await fetch(`${API_URL}/users/settings/tax`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taxRate: Number(taxRate),
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Update user tax settings failed");
    }

    return res.json();
  } catch (error) {
    console.error("updateUserTaxSettings failed:", error);
    throw error;
  }
};
