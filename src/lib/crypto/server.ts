// Basic server-side crypto implementation
import crypto from 'crypto';

export class ServerCrypto {
  static generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  static encrypt(text: string, secret: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', secret);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  static decrypt(encryptedText: string, secret: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', secret);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
