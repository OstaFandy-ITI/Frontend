export class UserChatRequestDto {
    constructor(
        public userid:string,
        public message:string,
    ){}
}

export class UserChatResponseDto{
    constructor(
        public suggestedService:string
    ){}
} 