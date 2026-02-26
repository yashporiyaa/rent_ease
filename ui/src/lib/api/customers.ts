import { API_URL } from "./config";
import type { CustomerListItem } from "../../types";

type ApiErrorBody = {
  message?: string;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

const readJsonSafely = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const requestJson = async <T>(
  path: string,
  init: RequestInit,
  defaultErrorMessage: string,
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, init);
  const payload = await readJsonSafely(response);

  if (!response.ok) {
    const errorBody = payload as ApiErrorBody | null;
    throw new Error(errorBody?.message || defaultErrorMessage);
  }

  return payload as T;
};

export const createCustomer = async (
  name: string,
  phone1?: string,
  phone2?: string,
  address?: string,
): Promise<ApiResponse<CustomerListItem>> => {
  try {
    return requestJson<ApiResponse<CustomerListItem>>(
      "/customers",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone1,
          phone2,
          address,
        }),
      },
      "Create customer failed",
    );
  } catch (error) {
    console.error("createCustomer failed:", error);
    throw error;
  }
};

export const findCustomerByPhone = async (
  phone: string,
): Promise<ApiResponse<CustomerListItem | null>> => {
  try {
    return requestJson<ApiResponse<CustomerListItem | null>>(
      `/customers/by-phone/${phone}`,
      { credentials: "include" },
      "Find customer by phone failed",
    );
  } catch (error) {
    console.error("findCustomerByPhone failed:", error);
    throw error;
  }
};

export const updateCustomer = async (
  id: string,
  payload: { name?: string; phone1?: string; phone2?: string; address?: string },
): Promise<ApiResponse<CustomerListItem>> => {
  try {
    return requestJson<ApiResponse<CustomerListItem>>(
      `/customers/${id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      "Update customer failed",
    );
  } catch (error) {
    console.error("updateCustomer failed:", error);
    throw error;
  }
};

export const getCustomers = async (): Promise<ApiResponse<CustomerListItem[]>> => {
  try {
    return requestJson<ApiResponse<CustomerListItem[]>>(
      "/customers",
      { credentials: "include" },
      "Fetch customers failed",
    );
  } catch (error) {
    console.error("getCustomers failed:", error);
    throw error;
  }
};
