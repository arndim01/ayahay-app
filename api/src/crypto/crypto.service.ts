import { Injectable } from '@nestjs/common';
import { verify, sign, subtle, KeyObject } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly ayahayImportAlgorithm: EcKeyImportParams = {
    name: 'ECDSA',
    namedCurve: 'P-256',
  };

  async verifyAyahaySignature(
    signed: Buffer,
    original: Buffer
  ): Promise<boolean> {
    const publicKey = await this.importAyahayPublicKey();
    return verify('SHA256', original, KeyObject.from(publicKey), signed);
  }

  async signWithAyahay(toSign: Buffer): Promise<Buffer> {
    const privateKey = await this.importAyahayPrivateKey();
    return sign('SHA256', toSign, KeyObject.from(privateKey));
  }

  private async importAyahayPublicKey(): Promise<CryptoKey> {
    const publicKeyBuf = Buffer.from(process.env.AYAHAY_PUBLIC_KEY, 'base64');

    return subtle.importKey(
      'spki',
      publicKeyBuf,
      this.ayahayImportAlgorithm,
      true,
      ['verify']
    );
  }

  private async importAyahayPrivateKey(): Promise<CryptoKey> {
    const privateKeyBuf = Buffer.from(process.env.AYAHAY_PRIVATE_KEY, 'base64');

    return subtle.importKey(
      'pkcs8',
      privateKeyBuf,
      this.ayahayImportAlgorithm,
      true,
      ['sign']
    );
  }
}
