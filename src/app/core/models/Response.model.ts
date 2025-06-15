export class ResponseDto<T> {
  constructor(
    public isSuccess: boolean,
    public message: string,
    public data: T | null = null,
    public statusCode: number
  ) {}
}

export class CacheItem<T> {
  constructor(public value: T, public expiry: number) {}
}
