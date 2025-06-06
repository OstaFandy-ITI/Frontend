export class Response<T> {
    constructor(
        public IsSuccess: boolean,
        public Message: string,
        public Data: T | null = null,
        StatusCode: number
    ) {}

}