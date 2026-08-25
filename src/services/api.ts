import {
  User,
  Customer,
  Ticket,
  TicketComment,
  DashboardStats,
  AuthResponse,
  UserRole,
} from '../types';

const TOKEN_KEY = 'supportdesk_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An unexpected server error occurred.');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; company?: string; phone?: string }) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  demoLogin: (role: UserRole) =>
    request<AuthResponse>('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  // Users (Admin)
  getUsers: () => request<User[]>('/api/users'),

  createUser: (data: { name: string; email: string; password: string; role: UserRole }) =>
    request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUserRole: (id: string, role: UserRole) =>
    request<User>(`/api/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  deleteUser: (id: string) =>
    request<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    }),

  // Customers
  getCustomers: () => request<Customer[]>('/api/customers'),

  getCustomerById: (id: string) =>
    request<Customer & { tickets: Ticket[] }>(`/api/customers/${id}`),

  createCustomer: (data: Partial<Customer>) =>
    request<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCustomer: (id: string, data: Partial<Customer>) =>
    request<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCustomer: (id: string) =>
    request<{ message: string }>(`/api/customers/${id}`, {
      method: 'DELETE',
    }),

  // Tickets
  getTickets: (params?: { q?: string; status?: string; priority?: string; category?: string; agentId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.agentId) searchParams.append('agentId', params.agentId);

    const queryString = searchParams.toString();
    return request<Ticket[]>(`/api/tickets${queryString ? `?${queryString}` : ''}`);
  },

  getTicketById: (id: string) => request<Ticket>(`/api/tickets/${id}`),

  createTicket: (data: Partial<Ticket>) =>
    request<Ticket>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTicket: (id: string, data: Partial<Ticket>) =>
    request<Ticket>(`/api/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTicket: (id: string) =>
    request<{ message: string }>(`/api/tickets/${id}`, {
      method: 'DELETE',
    }),

  // Comments
  getComments: (ticketId: string) => request<TicketComment[]>(`/api/tickets/${ticketId}/comments`),

  addComment: (ticketId: string, content: string) =>
    request<TicketComment>(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Dashboard
  getDashboardStats: () => request<DashboardStats>('/api/dashboard/stats'),
};
