export interface TokenPayload {
    id: number;
    email: string;
    role: string;
    iat?: number; // issued at
    exp?: number; // expiration
}
