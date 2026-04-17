// cloudflare-worker/src/index.js — ShadowSpeak API Proxy
// Validates Firebase ID tokens, injects cantonese.ai API key, rate limits per user.

const ALLOWED_PATHS = ['/tts', '/stt', '/score-pronunciation', '/ai-chat', '/tts-english', '/push-subscribe', '/push-unsubscribe', '/create-checkout-session'];
const STRIPE_API_URL = 'https://api.stripe.com/v1/checkout/sessions';
const APP_BASE_URL = 'https://flantzhk.github.io/shadowspeaklaunch';
const VAPID_PUBLIC_KEY = 'BCmqvXWvZ-9ES9BJWC9fkC_RoZ16Fh3p3i5IB1uF_YpdM54OUeBTfrCKppryPIx0_6dB6SQcDixoD22J1Y2Q08M';
const VAPID_SUBJECT = 'mailto:faith@shadowspeak.app';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const ELEVENLABS_VOICE_ID = 'XrExE9yKIg1WjnnlVkGX'; // Rachel
const AI_CHAT_RATE_LIMIT = 20; // per hour, separate from cantonese.ai endpoints
const GOOGLE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const FIREBASE_PROJECT_ID = 'shadowspeak-22f04';

// Cache Google public keys (they rotate ~daily)
let cachedKeys = null;
let cacheExpiry = 0;

export default {
  async fetch(request, env) {

    const url = new URL(request.url);
    const path = url.pathname;

    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = [
      'https://flantzhk.github.io',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ];
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
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

    // Route /ai-chat separately — calls Anthropic, not cantonese.ai
    if (path === '/ai-chat') {
      const aiHourKey = `rate:ai:${user.sub}:${Math.floor(Date.now() / 3600000)}`;
      const aiCount = parseInt(await env.RATE_LIMIT.get(aiHourKey) || '0');
      if (aiCount >= AI_CHAT_RATE_LIMIT) {
        return new Response('Rate limit exceeded', { status: 429, headers: corsHeaders });
      }
      await env.RATE_LIMIT.put(aiHourKey, String(aiCount + 1), { expirationTtl: 3600 });

      try {
        const body = await request.json();
        const result = await handleAiChat(body, env);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error('AI chat error:', err);
        return new Response(JSON.stringify({ error: 'AI chat failed' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Route /push-subscribe — store a Web Push subscription for this user
    if (path === '/push-subscribe') {
      try {
        const body = await request.json();
        const { subscription, reminderTime } = body;
        if (!subscription?.endpoint) return new Response('Missing subscription', { status: 400, headers: corsHeaders });
        await env.PUSH_SUBS.put(`sub:${user.sub}`, JSON.stringify({ subscription, reminderTime: reminderTime || null, uid: user.sub }), { expirationTtl: 60 * 60 * 24 * 90 }); // 90 days
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response('Push subscribe failed', { status: 500, headers: corsHeaders });
      }
    }

    // Route /push-unsubscribe — remove a subscription
    if (path === '/push-unsubscribe') {
      try {
        await env.PUSH_SUBS.delete(`sub:${user.sub}`);
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response('Push unsubscribe failed', { status: 500, headers: corsHeaders });
      }
    }

    // Route /tts-english — calls ElevenLabs for English narration
    if (path === '/tts-english') {
      try {
        const body = await request.json();
        const audioBlob = await handleEnglishTts(body, env);
        return new Response(audioBlob, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
        });
      } catch (err) {
        console.error('English TTS error:', err);
        return new Response('English TTS failed', { status: 502, headers: corsHeaders });
      }
    }

    // Route /create-checkout-session — creates a Stripe Checkout session and returns the redirect URL
    if (path === '/create-checkout-session') {
      try {
        const body = await request.json();
        const { planId } = body;

        const priceMap = {
          monthly:  env.STRIPE_PRICE_MONTHLY,
          annual:   env.STRIPE_PRICE_ANNUAL,
          lifetime: env.STRIPE_PRICE_LIFETIME,
          family:   env.STRIPE_PRICE_FAMILY,
        };

        const priceId = priceMap[planId];
        if (!priceId) {
          return new Response(JSON.stringify({ error: 'Invalid plan' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // lifetime is a one-time payment; everything else is a subscription
        const isLifetime = planId === 'lifetime';
        const isAnnual   = planId === 'annual';

        const params = new URLSearchParams({
          mode:                        isLifetime ? 'payment' : 'subscription',
          'line_items[0][price]':      priceId,
          'line_items[0][quantity]':   '1',
          success_url:                 `${APP_BASE_URL}/?checkout=success`,
          cancel_url:                  `${APP_BASE_URL}/?checkout=cancel`,
          client_reference_id:         user.sub,
        });

        // Annual plan — 7-day free trial
        if (isAnnual) {
          params.set('subscription_data[trial_period_days]', '7');
        }

        // Pre-fill email if available in the Firebase token
        if (user.email) {
          params.set('customer_email', user.email);
        }

        const stripeRes = await fetch(STRIPE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization':  `Bearer ${env.STRIPE_SECRET_KEY}`,
            'Content-Type':   'application/x-www-form-urlencoded',
          },
          body: params,
        });

        if (!stripeRes.ok) {
          const errText = await stripeRes.text();
          console.error('Stripe error:', errText);
          throw new Error(`Stripe ${stripeRes.status}`);
        }

        const session = await stripeRes.json();
        return new Response(JSON.stringify({ url: session.url }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error('Checkout session error:', err);
        return new Response(JSON.stringify({ error: 'Checkout failed. Please try again.' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Clone request body and inject cantonese.ai API key
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

  // Scheduled handler — runs every hour via CRON, sends push reminders
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendScheduledPushes(env));
  },
};

/**
 * Iterate all push subscriptions and send to users whose reminder time matches current UTC hour.
 */
async function sendScheduledPushes(env) {
  const nowHour = new Date().getUTCHours(); // 0–23
  const { keys } = await env.PUSH_SUBS.list({ prefix: 'sub:' });
  if (!keys?.length) return;

  const messages = [
    "Time to practice Cantonese! Keep your streak alive.",
    "Your daily Cantonese lesson is waiting.",
    "5 minutes of Cantonese today keeps the streak going!",
    "Ready to shadow? Your phrases are waiting.",
  ];
  const body = messages[Math.floor(Math.random() * messages.length)];

  for (const key of keys) {
    try {
      const raw = await env.PUSH_SUBS.get(key.name);
      if (!raw) continue;
      const { subscription, reminderTime } = JSON.parse(raw);
      if (!subscription?.endpoint) continue;

      // reminderTime is "HH:MM" in user's local time — we approximate with UTC hour
      if (reminderTime) {
        const [remHour] = reminderTime.split(':').map(Number);
        if (remHour !== nowHour) continue;
      }

      await sendWebPush(subscription, body, env);
    } catch (e) {
      console.error('Push send failed for', key.name, e);
    }
  }
}

/**
 * Send a Web Push notification using VAPID authentication.
 * Payload is sent as plaintext (works for same-origin subscribers — Chrome/Firefox).
 * Uses the Content-Encoding: aesgcm-no-encrypt draft for simplicity.
 */
async function sendWebPush(subscription, bodyText, env) {
  const endpoint = subscription.endpoint;
  const audience = new URL(endpoint).origin;

  const jwt = await buildVapidJWT(audience, env.VAPID_PRIVATE_KEY);

  const payload = JSON.stringify({ title: 'ShadowSpeak', body: bodyText });
  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(payload);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
      'Content-Type': 'application/json',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
      'Urgency': 'normal',
    },
    body: encodedPayload,
  });

  if (!response.ok && response.status !== 201) {
    const text = await response.text();
    // 404/410 means the subscription expired — clean it up
    if (response.status === 404 || response.status === 410) {
      const uid = subscription.uid;
      if (uid) await env.PUSH_SUBS.delete(`sub:${uid}`);
    }
    throw new Error(`Push ${response.status}: ${text}`);
  }
}

/**
 * Build a VAPID JWT signed with the private key using Web Crypto (ES256).
 */
async function buildVapidJWT(audience, vapidPrivateKeyB64url) {
  const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 43200, // 12 hours
    sub: VAPID_SUBJECT,
  })));
  const toSign = `${header}.${payload}`;

  // Import the VAPID private key (raw EC key, base64url encoded)
  const rawKey = base64UrlDecode(vapidPrivateKeyB64url);
  const privateKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(toSign)
  );

  return `${toSign}.${base64UrlEncode(new Uint8Array(sig))}`;
}

function base64UrlEncode(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const bin = atob(padded + '='.repeat(padLen));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

/**
 * Call Anthropic Claude to generate a Cantonese conversation response.
 * @param {{ messages: Object[], scenario: Object }} body
 * @param {Object} env - Worker env bindings
 * @returns {Promise<{chinese: string, english: string}>}
 */
async function handleAiChat(body, env) {
  const { messages = [], scenario = {} } = body;

  const systemPrompt = [
    scenario.systemContext || 'You are a friendly Cantonese speaker in Hong Kong.',
    'RULES:',
    '- Respond ONLY in colloquial Cantonese (written Cantonese, not standard written Chinese).',
    '- Keep each response to 1-2 short sentences maximum.',
    '- Use everyday vocabulary appropriate for a beginner learner.',
    '- Be natural, warm, and encouraging.',
    '- If the user makes a mistake, gently continue the conversation without correcting.',
    '- You MUST respond with ONLY a JSON object in exactly this format (no other text):',
    '  {"chinese": "<Cantonese response>", "english": "<English translation>"}',
  ].join('\n');

  // Convert app message format to Claude's format
  const claudeMessages = messages.map(msg => {
    if (msg.role === 'user') {
      const content = msg.chinese
        ? msg.chinese
        : `[User typed in English]: ${msg.english}`;
      return { role: 'user', content };
    }
    // Reconstruct assistant turns in the JSON format Claude expects to continue with
    return {
      role: 'assistant',
      content: JSON.stringify({ chinese: msg.chinese || '', english: msg.english || '' }),
    };
  });

  // Seed an opening turn if this is the start of conversation
  if (claudeMessages.length === 0) {
    claudeMessages.push({
      role: 'user',
      content: '[Start the conversation — greet me naturally as your character would]',
    });
  }

  const anthropicRes = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 256,
      system: systemPrompt,
      messages: claudeMessages,
    }),
  });

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    throw new Error(`Anthropic API ${anthropicRes.status}: ${errText}`);
  }

  const data = await anthropicRes.json();
  const text = data.content?.[0]?.text || '{}';

  // Strip any markdown code fences Claude might wrap around the JSON
  const cleaned = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    chinese: parsed.chinese || '',
    english: parsed.english || '',
  };
}

/**
 * Generate English speech via ElevenLabs.
 * @param {{ text: string }} body
 * @param {Object} env - Worker env bindings
 * @returns {Promise<ArrayBuffer>} MP3 audio
 */
async function handleEnglishTts(body, env) {
  const { text = '' } = body;
  if (!text.trim()) throw new Error('No text provided');

  const res = await fetch(`${ELEVENLABS_API_URL}/${ELEVENLABS_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': env.ELEVENLABS_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${errText}`);
  }

  return res.arrayBuffer();
}

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
