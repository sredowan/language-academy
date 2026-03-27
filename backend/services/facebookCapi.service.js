const axios = require('axios');

const PIXEL_ID = process.env.FB_PIXEL_ID;
const ACCESS_TOKEN = process.env.FB_CAPI_TOKEN;

/**
 * Send an event to Facebook Conversions API (CAPI)
 * @param {string} eventName - Standard or Custom Event Name (e.g. 'PageView', 'Purchase', 'Lead')
 * @param {object} userData - User data (em, ph, client_ip_address, client_user_agent, fbc, fbp)
 * @param {object} customData - Event specific custom data (currency, value, contents)
 * @param {string} eventUrl - URL where the event occurred
 */
exports.sendEvent = async (eventName, userData, customData = {}, eventUrl = '') => {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn('Facebook CAPI not configured. Skipping event:', eventName);
    return;
  }

  // CAPI payload requires user data to be hashed (em, ph, fn, ln) if present.
  // In a real implementation, you would hash these with crypto.createHash('sha256').
  // For this integration snippet, we assume the frontend/caller handles hashing, 
  // or we only send standard non-PII user parameters like IP and User Agent.
  
  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: eventUrl,
        user_data: userData,
        custom_data: customData,
      }
    ]
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    console.log(`FB CAPI Event '${eventName}' sent successfully. Trace ID:`, response.data.fbtrace_id);
    return response.data;
  } catch (error) {
    console.error(`FB CAPI Event '${eventName}' failed:`, error.response?.data?.error?.message || error.message);
  }
};
