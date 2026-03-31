import { API_BASE_URL } from '@/config';


export const api = {
  getProducts: async () => {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },
  
  getFeaturedProducts: async () => {
    const res = await fetch(`${API_BASE_URL}/products/featured`);
    if (!res.ok) throw new Error("Failed to fetch featured products");
    return res.json();
  },

  createOrder: async (orderData: any) => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
  },

  submitContactForm: async (contactData: any) => {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactData),
    });
    if (!res.ok) throw new Error("Failed to submit contact form");
    return res.json();
  },

  // Admin Methods
  adminLogin: async (password: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error("Invalid password");
    return res.json();
  },

  getAdminOrders: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  },

  getAdminContacts: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/contacts`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  },

  createAdminProduct: async (token: string, productData: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/products`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },

  updateAdminProduct: async (token: string, id: string, productData: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },

  deleteAdminProduct: async (token: string, id: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return res.json();
  },

  updateAdminOrder: async (token: string, id: string, status: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update order");
    return res.json();
  }
};
