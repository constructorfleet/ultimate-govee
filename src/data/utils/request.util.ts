import axios, { AxiosResponse } from 'axios';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export interface ApiResponseStatus {
  statusCode: number;
  message: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: ApiResponseStatus,
  ) {
    super(message);
  }
}

export class BaseRequest {
  constructor() {}
}

export class BaseResponse {
  constructor() {}

  public message?: string;

  public msg?: string;

  public status?: number;
}

export class Request<PayloadType extends BaseRequest> {
  constructor(
    private url: string,
    private headers: Record<string, string>,
    private payload: PayloadType | undefined = undefined,
  ) {}

  async get<ResponseType>(
    as: ClassConstructor<ResponseType>,
  ): Promise<AxiosResponse<ResponseType | ResponseType[]>> {
    delete this.headers['Content-Type'];
    const res = await axios.get<ResponseType>(this.url, {
      timeout: 10000,
      headers: this.headers,
      params: this.payload,
    });

    if (res.status !== 200) {
      throw new ApiError(res.statusText, {
        message: res.statusText,
        statusCode: res.status,
      });
    }
    res.data = plainToInstance(as, res.data);
    return res;
  }

  async post<ResponseType extends BaseResponse>(
    as: ClassConstructor<ResponseType>,
  ): Promise<AxiosResponse<ResponseType>> {
    const res = await axios.post<ResponseType>(this.url, this.payload, {
      timeout: 10000,
      headers: this.headers,
    });

    if (res.status !== 200 || res.data.status !== 200) {
      throw new ApiError(res.data.message, {
        message: res.data.message,
        statusCode: res.data.status,
      });
    }

    res.data = plainToInstance(as, res.data);

    return res;
  }
}

export function request<PayloadType extends BaseRequest = BaseRequest>(
  url: string,
  headers: Record<string, string>,
  payload: PayloadType | undefined = undefined,
): Request<PayloadType> {
  return new Request<PayloadType>(url, headers, payload);
}
