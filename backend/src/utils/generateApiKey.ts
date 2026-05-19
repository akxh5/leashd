import { randomUUID } from 'crypto'

export function generateApiKey(): string {
  return `lshd_${randomUUID().replace(/-/g, '')}`
}
