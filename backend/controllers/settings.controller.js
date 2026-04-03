const SystemSetting = require('../models/SystemSetting');
const { encrypt, decrypt } = require('../utils/encryption');

// Predefined configuration keys
const DEFAULT_SETTINGS = [
  { setting_key: 'SMTP_HOST', setting_value: 'smtp.hostinger.com', description: 'Outgoing Mail Server (SMTP)', is_secret: false },
  { setting_key: 'SMTP_PORT', setting_value: '465', description: 'SMTP Port', is_secret: false },
  { setting_key: 'SMTP_USER', setting_value: '', description: 'SMTP Username / Email', is_secret: false },
  { setting_key: 'SMTP_PASS', setting_value: '', description: 'SMTP Password', is_secret: true },
  { setting_key: 'SMS_API_KEY', setting_value: '', description: 'Alpha SMS / BulkSMSBD API Key', is_secret: true },
  { setting_key: 'SMS_SENDER_ID', setting_value: '', description: 'Approved Sender ID', is_secret: false }
];

// Ensure defaults exist upon first load
exports.initializeDefaults = async () => {
  for (let def of DEFAULT_SETTINGS) {
    const exists = await SystemSetting.findOne({ where: { setting_key: def.setting_key } });
    if (!exists) {
      let valToSave = def.setting_value;
      if (def.is_secret && valToSave) valToSave = encrypt(valToSave);
      await SystemSetting.create({ ...def, setting_value: valToSave });
    }
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll({ order: [['id', 'ASC']] });
    
    const formattedSettings = settings.map(setting => {
      let val = setting.setting_value;
      if (setting.is_secret && val) {
        val = decrypt(val);
      }
      return {
        id: setting.id,
        key: setting.setting_key,
        value: val,
        description: setting.description,
        is_secret: setting.is_secret
      };
    });

    res.json(formattedSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body; // Array of { key, value }
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Expected an array of settings to update.' });
    }

    for (let update of updates) {
      const setting = await SystemSetting.findOne({ where: { setting_key: update.key } });
      if (setting) {
        let valToSave = update.value;
        if (setting.is_secret && valToSave) {
          valToSave = encrypt(valToSave);
        }
        await setting.update({ setting_value: valToSave });
      }
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
