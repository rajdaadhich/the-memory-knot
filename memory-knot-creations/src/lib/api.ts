import { API_BASE_URL } from '@/config';


export const api = {
  getProducts: async () => {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  getProductsPaginated: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.page)     query.set('page',     String(params.page));
    if (params.limit)    query.set('limit',    String(params.limit));
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.search)   query.set('search',   params.search);
    if (params.sort && params.sort !== 'popular') query.set('sort', params.sort);
    const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json() as Promise<{ products: any[]; total: number; page: number; limit: number; hasMore: boolean }>;
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
  adminLogin: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    return res.json();
  },

  forgotPassword: async (email: string, frontendUrl: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, frontendUrl }),
    });
    if (!res.ok) throw new Error("Failed to request reset");
    return res.json();
  },

  resetPassword: async (email: string, token: string, newPassword: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, newPassword }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to reset password");
    }
    return res.json();
  },

  getAdminProfile: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  },

  updateAdminProfile: async (token: string, profileData: any) => {
    const res = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to update profile");
    }
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
  
  deleteAdminContact: async (token: string, id: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/contacts/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete message");
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

  updateAdminOrder: async (token: string, id: string, status?: string, trackingId?: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status, trackingId }),
    });
    if (!res.ok) throw new Error("Failed to update order");
    return res.json();
  }
};
