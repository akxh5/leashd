import nacl from 'tweetnacl'
import { decodeUTF8 } from 'tweetnacl-util'
import bs58 from 'bs58'

export function verifyWalletSignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const messageBytes = decodeUTF8(message)
    const signatureBytes = bs58.decode(signature)
    const publicKeyBytes = bs58.decode(publicKey)
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    )
  } catch {
    return false
  }
}
