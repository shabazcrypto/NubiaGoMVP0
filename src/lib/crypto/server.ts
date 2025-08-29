// Basic server-side crypto implementation
import CryptoJS from 'crypto-js';

export class ServerCrypto {
  static generateSecret(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }
  
  static encrypt(text: string, secret: string): string {
    return CryptoJS.AES.encrypt(text, secret).toString();
  }
  
  static decrypt(encryptedText: string, secret: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, secret);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
