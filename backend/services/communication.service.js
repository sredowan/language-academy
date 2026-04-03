const nodemailer = require('nodemailer');
const axios = require('axios');
const Activity = require('../models/Activity');
const SystemSetting = require('../models/SystemSetting');
const { decrypt } = require('../utils/encryption');

/**
 * Communication Service to handle dispatching Emails and SMS (Alpha SMS BD / Bulk SMS BD).
 * Currently implemented in Simulation Mode so keys can be plugged in later.
 */

/**
 * Helper to get a config value, decrypting if it is set as a secret.
 * Falls back to process.env if available, just in case.
 */
const getConfig = async (key) => {
  try {
    const setting = await SystemSetting.findOne({ where: { setting_key: key } });
    if (setting && setting.setting_value) {
      if (setting.is_secret) {
        return decrypt(setting.setting_value);
      }
      return setting.setting_value;
    }
  } catch (err) {
    console.error(`[COMM_SERVICE] Error fetching config ${key}`, err);
  }
  return process.env[key];
};

/**
 * Configure Hostinger SMTP transporter setup
 * This gets configured per-send now to allow dynamic setting updates,
 * or cached effectively if preferred. We'll build a fresh transport each time
 * to ensure if superadmin changes settings, they apply immediately.
 */
const createTransporter = async () => {
  const host = await getConfig('SMTP_HOST') || 'smtp.hostinger.com';
  const port = parseInt(await getConfig('SMTP_PORT')) || 465;
  const user = await getConfig('SMTP_USER') || 'your-email@yourdomain.com';
  const pass = await getConfig('SMTP_PASS') || 'your-smtp-password';

  return nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: { user, pass }
  });
};

/**
 * Replace variables like {{name}} or {{course}} in the text
 */
const parseTemplate = (text, recipient) => {
  if (!text) return '';
  return text
    .replace(/\{\{name\}\}/gi, recipient.name || '')
    .replace(/\{\{phone\}\}/gi, recipient.phone || '')
    .replace(/\{\{email\}\}/gi, recipient.email || '')
    .replace(/\{\{course\}\}/gi, recipient.batch_interest || recipient.course_interest || 'our course');
};

/**
 * Send an email using Nodemailer
 */
const sendEmail = async (to, subject, htmlBody, attachments = []) => {
  const user = await getConfig('SMTP_USER');
  
  if (!user || user === 'your-email@yourdomain.com') {
    console.log(`[SIMULATION] Email Sent to: ${to} | Object: ${subject}`);
    await new Promise(r => setTimeout(r, 200));
    return { success: true, message: 'Simulated Email Sent' };
  }

  const transporter = await createTransporter();

  const mailOptions = {
    from: `"Language Academy" <${user}>`,
    to,
    subject,
    html: htmlBody,
    attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, message: `Email sent: ${info.messageId}` };
  } catch (error) {
    console.error('[COMM_SERVICE] Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send an SMS via BulkSMSBD / Alpha SMS
 */
const sendSMS = async (to, message) => {
  const apiKey = await getConfig('SMS_API_KEY');
  const senderId = await getConfig('SMS_SENDER_ID');

  if (!apiKey) {
    console.log(`[SIMULATION] SMS Sent to: ${to} | Message: ${message}`);
    await new Promise(r => setTimeout(r, 200));
    return { success: true, message: 'Simulated SMS Sent' };
  }

  try {
    const url = `http://bulksmsbd.net/api/smsapi`;
    const response = await axios.post(url, {
      api_key: apiKey,
      senderid: senderId,
      number: to,
      message: message
    });
    return { success: true, response: response.data };
  } catch (error) {
    console.error('[COMM_SERVICE] SMS send failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Bulk Dispatcher (Background Processor)
 * Mapped to CRM targets and generates CRM Activities.
 */
const processCampaignBatch = async (campaign, recipients) => {
  console.log(`[COMM_SERVICE] Starting campaign dispatch for ID ${campaign.id} to ${recipients.length} recipients...`);
  
  let successCount = 0;
  
  for (const recipient of recipients) {
    const isEmail = campaign.channel === 'email';
    const isSms = campaign.channel === 'sms' || campaign.channel === 'whatsapp'; // using sms implementation for both unless specified
    
    // Determine destination (email or phone)
    const destination = isEmail ? recipient.email : recipient.phone;
    if (!destination) continue; // Skip if contact missing info

    // Parse specific variables per recipient
    const parsedSubject = parseTemplate(campaign.subject || campaign.name, recipient);
    const parsedBody = parseTemplate(campaign.body, recipient);

    let dispatchResult = { success: false };

    if (isEmail) {
      let attachments = [];
      if (campaign.attachment_url) {
        // Automatically set the downloaded name from url, or let nodemailer handle `path: url`
        // Nodemailer supports { path: 'https://...' } natively for attachments.
        attachments.push({ path: campaign.attachment_url });
      }
      dispatchResult = await sendEmail(destination, parsedSubject, parsedBody, attachments);
    } else {
      dispatchResult = await sendSMS(destination, parsedBody);
    }

    if (dispatchResult.success) {
      successCount++;
      // Log the Activity
      try {
        await Activity.create({
          branch_id: campaign.branch_id,
          lead_id: recipient.status ? recipient.id : null, // If it's a lead, status exists usually
          contact_id: recipient.status ? null : recipient.id, // Better tracking logic exists in controllers usually, but this is base
          type: isEmail ? 'email' : 'call', // DB enum constraint typically is 'email' or 'call' or 'meeting'
          subject: `Campaign: ${campaign.name}`,
          description: `Sent via ${campaign.channel}: ${parsedBody.substring(0, 100)}...`,
          due_date: new Date(),
          is_done: true,
          completed_at: new Date(),
          created_by: campaign.created_by
        });
      } catch (err) {
        console.error('[COMM_SERVICE] Failed to create CRM Activity log for recipient.', err.message);
      }
    }
  }

  console.log(`[COMM_SERVICE] Campaign ${campaign.id} completed. Effectively dispatched to ${successCount} recipients.`);
  
  // Optionally update campaign with final success stats here.
  // CampaignTemplate.update({ sent_count: successCount }, { where: { id: campaign.id } });
};

module.exports = {
  sendEmail,
  sendSMS,
  processCampaignBatch,
  parseTemplate
};
