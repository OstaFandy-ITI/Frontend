export class ResponseDto<T> {
    constructor(
        public isSuccess: boolean,
        public message: string,
        public data: T | null = null,
        public statusCode: number
    ) {}

}