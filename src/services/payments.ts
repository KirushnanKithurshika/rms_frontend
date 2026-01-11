import axios, { AxiosHeaders } from "axios";

const PAYMENT_BASE_URL =
  (import.meta.env.VITE_PAYMENTS_BASE_URL as string | undefined)?.replace(
    /\/+$/,
    ""
  ) ?? "http://localhost:8087/api/payments";

export type PaymentType = "TRANSCRIPT" | "FINE" | "RECORRECTION";

export type InitiatePaymentRequest = {
  userId: number;
  paymentType: PaymentType;
  amount: number;
};

export type PayHereCheckoutResponse = {
  merchantId: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  orderId: string;
  items: string;
  amount: number;
  currency: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
};

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type AdminPayment = {
  studentId: number;
  studentName: string;
  studentEmail: string;
  referenceId: string;
  paymentType: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payherePaymentId?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  isTranscriptRequest: boolean;
  isApproved: boolean;
};

export type AdminPaymentsResponse = {
  payments: AdminPayment[];
};

export type AdminPaymentsQuery = {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export const paymentsApi = axios.create({
  baseURL: PAYMENT_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

paymentsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || "";
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.delete("Authorization");
  }

  config.headers = headers;
  return config;
});

export async function initiatePayment(payload: InitiatePaymentRequest) {
  const res = await paymentsApi.post<PayHereCheckoutResponse>("/initiate", payload);
  return res.data;
}

export async function fetchAdminPayments(query: AdminPaymentsQuery = {}) {
  const res = await paymentsApi.get<AdminPaymentsResponse>("/admin/all", {
    params: {
      page: query.page ?? 0,
      size: query.size ?? 10,
      sortBy: query.sortBy ?? "createdAt",
      sortDir: query.sortDir ?? "desc",
    },
  });
  return res.data;
}

export async function approveTranscriptRequest(payherePaymentId: string) {
  const safeId = encodeURIComponent(payherePaymentId);
  const res = await paymentsApi.put<{ message?: string }>(
    `/${safeId}/approveTranscript`
  );
  return res.data;
}
