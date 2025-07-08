
export class UserRegisterDto{
    constructor(
        public email?: string,
        public firstName?: string,
        public lastName?: string,
        public phone?: string,
        public password?: string,
        public confirmPassword?: string,
        public role?: string
    ){}

     passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }
}

export class UserLoginDto {
    constructor(
        public email?: string,
        public password?: string
    ){}
}

export class LoggedInUser {
    constructor(
        public NameIdentifier?: string,
        public Email?: string,
        public GivenName?: string,
        public Surname?: string,
        public UserType?: string,
        public exp?: string
    ){}
}

export class ResetPasswordDto
{
    constructor(
        public email:string,
        public otp:string,
        public newPassword:string,
    ){}
}

