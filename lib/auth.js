import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = await scrypt(password, salt, KEY_LENGTH);
    return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
    const [salt, hashHex] = (stored || '').split(':');
    if (!salt || !hashHex) return false;
    const derived = await scrypt(password, salt, KEY_LENGTH);
    const hashBuf = Buffer.from(hashHex, 'hex');
    return derived.length === hashBuf.length && crypto.timingSafeEqual(derived, hashBuf);
}

function getSecret() {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
        throw new Error(
            'A variável de ambiente AUTH_SECRET não está definida. Gere uma com `openssl rand -hex 32` e configure-a.'
        );
    }
    return secret;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function createSessionToken(userId, ttlMs = THIRTY_DAYS_MS) {
    const payload = { uid: userId, exp: Date.now() + ttlMs };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
    return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token) {
    if (!token) return null;
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    try {
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
        if (!payload.exp || payload.exp < Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
}
