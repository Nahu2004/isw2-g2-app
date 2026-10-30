/**
 * Cliente HTTP base compatible con la API de Axios para React / React Native.
 * Implementa interceptores de Request para Bearer Token e interceptores de Response
 * para captura centralizada de errores (401 Unauthorized con callback de logout,
 * y extracción uniforme de message/mensaje del backend).
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.225:8080/api';

type InterceptorCallback = (config: any) => any | Promise<any>;
type ErrorInterceptorCallback = (error: any) => any | Promise<any>;

class InterceptorManager {
  private handlers: { fulfilled?: InterceptorCallback; rejected?: ErrorInterceptorCallback }[] = [];

  use(fulfilled?: InterceptorCallback, rejected?: ErrorInterceptorCallback): number {
    this.handlers.push({ fulfilled, rejected });
    return this.handlers.length - 1;
  }

  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = {};
    }
  }

  getHandlers() {
    return this.handlers;
  }
}

export class AxiosError extends Error {
  response?: {
    status: number;
    statusText: string;
    data: any;
    headers?: any;
  };
  request?: any;
  config?: any;

  constructor(message: string, response?: any, config?: any) {
    super(message);
    this.name = 'AxiosError';
    this.response = response;
    this.config = config;
  }
}

export class AxiosClientInstance {
  baseURL: string;
  interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager(),
  };

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T = any>(config: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    data?: any;
    params?: Record<string, any>;
  }): Promise<{ data: T; status: number; statusText: string; headers: any }> {
    let currentConfig: any = {
      baseURL: this.baseURL,
      method: (config.method || 'GET').toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
      },
      ...config,
    };

    // Run request interceptors
    for (const handler of this.interceptors.request.getHandlers()) {
      if (handler.fulfilled) {
        try {
          currentConfig = await handler.fulfilled(currentConfig);
        } catch (err) {
          if (handler.rejected) {
            return handler.rejected(err);
          }
          throw err;
        }
      }
    }

    // Build URL
    let fullUrl = currentConfig.url || '';
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      const base = currentConfig.baseURL.replace(/\/+$/, '');
      const path = fullUrl.replace(/^\/+/, '');
      fullUrl = `${base}/${path}`;
    }

    if (currentConfig.params) {
      const sp = new URLSearchParams();
      Object.entries(currentConfig.params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          sp.append(k, String(v));
        }
      });
      const qs = sp.toString();
      if (qs) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
      }
    }

    const fetchOptions: RequestInit = {
      method: currentConfig.method,
      headers: currentConfig.headers,
    };

    if (
      currentConfig.data !== undefined &&
      currentConfig.method !== 'GET' &&
      currentConfig.method !== 'HEAD'
    ) {
      fetchOptions.body =
        typeof currentConfig.data === 'string'
          ? currentConfig.data
          : JSON.stringify(currentConfig.data);
    }

    let response: Response;
    try {
      response = await fetch(fullUrl, fetchOptions);
    } catch (networkError: any) {
      const axiosErr = new AxiosError(
        networkError.message || 'Error de conexión de red',
        undefined,
        currentConfig
      );
      return this.handleResponseError(axiosErr);
    }

    let responseData: any = null;
    if (response.status !== 204) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else {
        responseData = await response.text();
      }
    }

    const axiosResponse = {
      data: responseData as T,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: currentConfig,
    };

    if (!response.ok) {
      const errorMsg =
        (responseData && typeof responseData === 'object' && (responseData.message || responseData.mensaje || responseData.error)) ||
        `Request failed with status code ${response.status}`;
      const axiosErr = new AxiosError(errorMsg, axiosResponse, currentConfig);
      return this.handleResponseError(axiosErr);
    }

    // Run response success interceptors
    let finalResponse: any = axiosResponse;
    for (const handler of this.interceptors.response.getHandlers()) {
      if (handler.fulfilled) {
        finalResponse = await handler.fulfilled(finalResponse);
      }
    }
    return finalResponse;
  }

  private async handleResponseError(error: AxiosError) {
    let currentError: any = error;
    for (const handler of this.interceptors.response.getHandlers()) {
      if (handler.rejected) {
        try {
          currentError = await handler.rejected(currentError);
        } catch (rejErr) {
          currentError = rejErr;
        }
      }
    }
    throw currentError;
  }

  get<T = any>(url: string, config?: any) {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  post<T = any>(url: string, data?: any, config?: any) {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  patch<T = any>(url: string, data?: any, config?: any) {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  delete<T = any>(url: string, config?: any) {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

// Instancia singleton de axiosClient
const axiosClient = new AxiosClientInstance(BASE_URL);

// Variable en memoria y callbacks para token y logout
let authToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export const registerUnauthorizedHandler = (cb: () => void) => {
  onUnauthorizedCallback = cb;
};

// Interceptor de Request: inyectar Authorization: Bearer <token>
axiosClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }
  return config;
});

// Interceptor de Response: Manejo centralizado de 401 y unificación de errores
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
