// src/services/api.ts (offline stub)
// Backend integration removed: export a minimal axios-like stub so UI compiles and runs without network.

type StubResponse<T = any> = { data: any; status?: number; headers?: any; config?: any };

function wrap<T = any>(data?: T, status = 200): Promise<StubResponse<T>> {
  // Many callers expect { data: { status, data } } or raw data; we mimic common shape
  const envelope = { status: "success", data: typeof data === "undefined" ? {} : data };
  return Promise.resolve({ data: envelope, status });
}

const api: any = {
  baseURL: "",
  get: (_url: string, _config?: any) => wrap(),
  post: (_url: string, _body?: any, _config?: any) => wrap(),
  put: (_url: string, _body?: any, _config?: any) => wrap(),
  delete: (_url: string, _config?: any) => wrap(),
  interceptors: {
    request: { use: (_fn: any) => {} },
    response: { use: (_ok: any, _err?: any) => {} },
  },
};

export default api;

