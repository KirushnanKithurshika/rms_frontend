// src/shims/axios.ts - offline axios stub

export type AxiosResponse<T = any> = { data: any; status?: number; headers?: any; config?: any };

function wrap<T = any>(data?: T, status = 200): Promise<AxiosResponse<T>> {
  const envelope = { status: "success", data: typeof data === "undefined" ? {} : data };
  return Promise.resolve({ data: envelope, status });
}

const axios: any = {
  get: (_url: string, _config?: any) => wrap(),
  post: (_url: string, _body?: any, _config?: any) => wrap(),
  put: (_url: string, _body?: any, _config?: any) => wrap(),
  delete: (_url: string, _config?: any) => wrap(),
};

export default axios;

