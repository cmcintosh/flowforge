import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export class CredentialVault {
  private key: Buffer;

  constructor(encryptionKey?: string) {
    if (encryptionKey) {
      // Use provided key (must be 64 hex chars = 32 bytes)
      this.key = Buffer.from(encryptionKey, 'hex');
    } else {
      // Derive from env or generate a dev key
      const envKey = process.env.FLOWFORGE_ENCRYPTION_KEY;
      if (envKey) {
        this.key = Buffer.from(envKey, 'hex');
      } else {
        // Dev-only: derive a stable key from a fixed string
        this.key = crypto.scryptSync('flowforge-dev-key', 'flowforge-salt', 32);
      }
    }

    if (this.key.length !== 32) {
      throw new Error('FLOWFORGE_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    // Format: iv:authTag:encrypted (all hex)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(ciphertext: string): Record<string, unknown> {
    const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');
    if (!ivHex || !authTagHex || !encryptedHex) {
      throw new Error('Invalid ciphertext format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  }

  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
