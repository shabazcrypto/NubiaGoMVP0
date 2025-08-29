// Basic client-side crypto implementation
export class ClientCrypto {
  static generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
