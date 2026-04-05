const axios = require('axios');
const crypto = require('crypto');

const PIXEL_ID = process.env.FB_PIXEL_ID;
const ACCESS_TOKEN = process.env.FB_CAPI_TOKEN;
const API_VERSION = 'v19.0';

/**
 * SHA-256 hash a value (required by Facebook CAPI for PII fields).
 * Returns null if the value is empty/undefined.
 */
const hashSHA256 = (value) => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  // If already hashed (64 hex chars), return as-is
  if (/^[a-f0-9]{64}$/.test(trimmed)) return trimmed;
  return crypto.createHash('sha256').update(trimmed).digest('hex');
};

/**
 * Normalize and hash user data for Facebook CAPI.
 * Facebook requires em, ph, fn, ln, ct, st, zp, country, db, ge to be SHA-256 hashed.
 * client_ip_address, client_user_agent, fbc, fbp are sent as plain text.
 */
const normalizeUserData = (userData = {}) => {
  const normalized = {};

  // Hash PII fields
  if (userData.em) normalized.em = [hashSHA256(userData.em)];
  if (userData.ph) {
    // Remove non-digit characters before hashing
    const digits = userData.ph.replace(/\D/g, '');
    normalized.ph = [hashSHA256(digits)];
  }
  if (userData.fn) normalized.fn = [hashSHA256(userData.fn)];
  if (userData.ln) normalized.ln = [hashSHA256(userData.ln)];
  if (userData.ct) normalized.ct = [hashSHA256(userData.ct)];
  if (userData.st) normalized.st = [hashSHA256(userData.st)];
  if (userData.zp) normalized.zp = [hashSHA256(userData.zp)];
  if (userData.country) normalized.country = [hashSHA256(userData.country)];
  if (userData.db) normalized.db = [hashSHA256(userData.db)];
  if (userData.ge) normalized.ge = [hashSHA256(userData.ge)];
  
  // External IDs (hash them too)
  if (userData.external_id) normalized.external_id = [hashSHA256(String(userData.external_id))];

  // Non-hashed fields (sent as plain text)
  if (userData.client_ip_address) normalized.client_ip_address = userData.client_ip_address;
  if (userData.client_user_agent) normalized.client_user_agent = userData.client_user_agent;
  if (userData.fbc) normalized.fbc = userData.fbc;
  if (userData.fbp) normalized.fbp = userData.fbp;

  return normalized;
};

/**
 * Generate a unique event ID for deduplication between client-side pixel and server-side CAPI.
 */
const generateEventId = () => {
  return `evt_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
};

/**
 * Send an event to Facebook Conversions API (CAPI).
 * This replaces the need for Stape.io or any third-party server-side proxy.
 *
 * @param {string} eventName - Standard or Custom Event Name (e.g. 'PageView', 'Purchase', 'Lead')
 * @param {object} userData - User data object. PII fields (em, ph, fn, ln) will be auto-hashed.
 *                            Also accepts: client_ip_address, client_user_agent, fbc, fbp
 * @param {object} customData - Event-specific custom data (currency, value, contents, content_name, etc.)
 * @param {string} eventUrl - URL where the event occurred
 * @param {string} eventId - Optional event ID for deduplication with client-side pixel
 * @returns {object|null} Response data from Facebook, or null on failure
 */
exports.sendEvent = async (eventName, userData, customData = {}, eventUrl = '', eventId = null) => {
  if (!PIXEL_ID || !ACCESS_TOKEN || PIXEL_ID === 'YOUR_PIXEL_ID_HERE') {
    console.warn('[FB CAPI] Not configured. Skipping event:', eventName);
    return null;
  }

  const normalizedUserData = normalizeUserData(userData);
  const dedupEventId = eventId || generateEventId();

  const eventData = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_id: dedupEventId, // Used for deduplication with browser pixel
    user_data: normalizedUserData,
  };

  if (eventUrl) eventData.event_source_url = eventUrl;
  if (Object.keys(customData).length > 0) eventData.custom_data = customData;

  const payload = { data: [eventData] };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      payload,
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );
    console.log(`[FB CAPI] ✓ '${eventName}' sent | event_id: ${dedupEventId} | trace: ${response.data.fbtrace_id}`);
    return { ...response.data, event_id: dedupEventId };
  } catch (error) {
    const fbError = error.response?.data?.error;
    console.error(
      `[FB CAPI] ✗ '${eventName}' failed:`,
      fbError ? `${fbError.message} (code: ${fbError.code})` : error.message
    );
    return null;
  }
};

/**
 * Send a Lead event (standard Facebook event).
 * Call this when a new lead/enquiry is created from the website.
 */
exports.sendLeadEvent = async (req, { name, email, phone, courseName, value }) => {
  const nameParts = (name || '').trim().split(/\s+/);
  return exports.sendEvent(
    'Lead',
    {
      em: email,
      ph: phone,
      fn: nameParts[0],
      ln: nameParts.slice(1).join(' '),
      client_ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      client_user_agent: req.headers['user-agent'],
      fbc: req.headers['x-fbc'] || req.cookies?.['_fbc'] || null,
      fbp: req.headers['x-fbp'] || req.cookies?.['_fbp'] || null,
    },
    {
      content_name: courseName || 'General Enquiry',
      currency: 'BDT',
      value: value || 0,
    },
    req.headers['referer'] || req.headers['origin'] || 'https://languageacademy.com.bd',
    req.headers['x-event-id'] || null
  );
};

/**
 * Send a CompleteRegistration event.
 * Call this when a student enrollment is finalized.
 */
exports.sendRegistrationEvent = async (req, { name, email, phone, courseName, value }) => {
  const nameParts = (name || '').trim().split(/\s+/);
  return exports.sendEvent(
    'CompleteRegistration',
    {
      em: email,
      ph: phone,
      fn: nameParts[0],
      ln: nameParts.slice(1).join(' '),
      client_ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      client_user_agent: req.headers['user-agent'],
      fbc: req.headers['x-fbc'] || req.cookies?.['_fbc'] || null,
      fbp: req.headers['x-fbp'] || req.cookies?.['_fbp'] || null,
    },
    {
      content_name: courseName || 'Course Enrollment',
      currency: 'BDT',
      value: value || 0,
      status: 'enrolled',
    },
    req.headers['referer'] || req.headers['origin'] || 'https://languageacademy.com.bd'
  );
};

/**
 * Send a Contact event.
 * Call this when a contact form is submitted.
 */
exports.sendContactEvent = async (req, { name, email, phone }) => {
  const nameParts = (name || '').trim().split(/\s+/);
  return exports.sendEvent(
    'Contact',
    {
      em: email,
      ph: phone,
      fn: nameParts[0],
      ln: nameParts.slice(1).join(' '),
      client_ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      client_user_agent: req.headers['user-agent'],
      fbc: req.headers['x-fbc'] || req.cookies?.['_fbc'] || null,
      fbp: req.headers['x-fbp'] || req.cookies?.['_fbp'] || null,
    },
    {},
    req.headers['referer'] || req.headers['origin'] || 'https://languageacademy.com.bd'
  );
};

// Re-export utility for external use
exports.generateEventId = generateEventId;
exports.hashSHA256 = hashSHA256;
