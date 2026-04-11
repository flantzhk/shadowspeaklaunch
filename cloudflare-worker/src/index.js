// cloudflare-worker/src/index.js — ShadowSpeak API Proxy
// Validates Firebase ID tokens, injects cantonese.ai API key, rate limits per user.

const ALLOWED_PATHS = ['/tts', '/stt', '/score-pronunciation'];
const GOOGLE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const FIREBASE_PROJECT_ID = 'shadowspeak-22f04';

// Cache Google public keys (they rotate ~daily)
let cachedKeys = null;
let cacheExpiry = 0;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Lock to your domain in production
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!ALLOWED_PATHS.includes(path)) {
      return new Response('Not found', { status: 404, headers: corsHeaders });
    }

    // Validate auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const token = authHeader.slice(7);
    const user = await validateFirebaseToken(token);
    if (!user) {
      return new Response('Invalid token', { status: 401, headers: corsHeaders });
    }

    // Rate limit: 100 requests per user per hour
    const hourKey = `rate:${user.sub}:${Math.floor(Date.now() / 3600000)}`;
    const count = parseInt(await env.RATE_LIMIT.get(hourKey) || '0');
    if (count >= 100) {
      return new Response('Rate limit exceeded', { status: 429, headers: corsHeaders });
    }
    await env.RATE_LIMIT.put(hourKey, String(count + 1), { expirationTtl: 3600 });

    // Clone request body and inject API key
    const contentType = request.headers.get('Content-Type') || '';
    let forwardBody;
    const forwardHeaders = new Headers();

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.append('api_key', env.CANTONESE_AI_KEY);
      forwardBody = formData;
    } else {
      const json = await request.json();
      json.api_key = env.CANTONESE_AI_KEY;
      forwardBody = JSON.stringify(json);
      forwardHeaders.set('Content-Type', 'application/json');
    }

    const apiResponse = await fetch(`${env.CANTONESE_AI_BASE}${path}`, {
      method: 'POST',
      headers: forwardHeaders,
      body: forwardBody,
    });

    const responseHeaders = new Headers(apiResponse.headers);
    Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));

    return new Response(apiResponse.body, {
      status: apiResponse.status,
      headers: responseHeaders,
    });
  },
};

/**
 * Fetch Google's public signing keys (cached with TTL from headers).
 */
async function getGooglePublicKeys() {
  if (cachedKeys && Date.now() < cacheExpiry) return cachedKeys;

  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) throw new Error('Failed to fetch Google public keys');

  // Parse Cache-Control max-age for TTL
  const cacheControl = res.headers.get('Cache-Control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1]) * 1000 : 3600000;
  cacheExpiry = Date.now() + maxAge;

  cachedKeys = await res.json();
  return cachedKeys;
}

/**
 * Import an X.509 PEM certificate as a CryptoKey for RS256 verification.
 */
async function importPublicKey(pem) {
  const b64 = pem
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s/g, '');
  const binary = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'raw',
    extractPublicKeyFromCert(binary),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

/**
 * Extract the SubjectPublicKeyInfo from a DER-encoded X.509 certificate.
 * This is a minimal ASN.1 parser for the specific structure we need.
 */
function extractPublicKeyFromCert(certDer) {
  // Use the Web Crypto API's ability to import SPKI directly
  // We need to find the SubjectPublicKeyInfo in the certificate
  let offset = 0;

  function readTag() {
    const tag = certDer[offset++];
    let length = certDer[offset++];
    if (length & 0x80) {
      const numBytes = length & 0x7f;
      length = 0;
      for (let i = 0; i < numBytes; i++) {
        length = (length << 8) | certDer[offset++];
      }
    }
    return { tag, length, start: offset };
  }

  // Certificate SEQUENCE
  readTag();
  // TBSCertificate SEQUENCE
  readTag();
  // Version [0] EXPLICIT (optional)
  if (certDer[offset] === 0xa0) {
    const v = readTag();
    offset = v.start + v.length;
  }
  // Serial number
  const serial = readTag();
  offset = serial.start + serial.length;
  // Signature algorithm
  const sigAlg = readTag();
  offset = sigAlg.start + sigAlg.length;
  // Issuer
  const issuer = readTag();
  offset = issuer.start + issuer.length;
  // Validity
  const validity = readTag();
  offset = validity.start + validity.length;
  // Subject
  const subject = readTag();
  offset = subject.start + subject.length;
  // SubjectPublicKeyInfo — this is what we want
  const spkiStart = offset;
  const spki = readTag();
  const spkiEnd = spki.start + spki.length;

  return certDer.slice(spkiStart, spkiEnd).buffer;
}

/**
 * Validate a Firebase ID token using Google's public RS256 keys.
 * @param {string} token - JWT from Firebase Auth
 * @returns {Promise<Object|null>} Decoded payload or null if invalid
 */
async function validateFirebaseToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    // Check algorithm
    if (header.alg !== 'RS256') return null;

    // Check expiration
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;

    // Check issued-at is in the past
    if (!payload.iat || payload.iat * 1000 > Date.now() + 5000) return null;

    // Check audience matches our Firebase project
    if (payload.aud !== FIREBASE_PROJECT_ID) return null;

    // Check issuer
    if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null;

    // Check subject (uid) is non-empty
    if (!payload.sub) return null;

    // Verify signature with Google's public key
    const keys = await getGooglePublicKeys();
    const pem = keys[header.kid];
    if (!pem) return null;

    const publicKey = await crypto.subtle.importKey(
      'spki',
      extractPublicKeyFromCert(
        Uint8Array.from(
          atob(
            pem
              .replace(/-----BEGIN CERTIFICATE-----/g, '')
              .replace(/-----END CERTIFICATE-----/g, '')
              .replace(/\s/g, '')
          ),
          c => c.charCodeAt(0)
        )
      ),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = Uint8Array.from(
      atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signature,
      signatureInput
    );

    return valid ? payload : null;
  } catch (e) {
    console.error('Token validation error:', e);
    return null;
  }
}
