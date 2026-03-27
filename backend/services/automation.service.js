const Rule = require('../models/Rule');
const Notification = require('../models/Notification');

/**
 * Automation Service
 * Handles processing of system triggers based on active rules.
 */
class AutomationService {
  
  /**
   * Process a system trigger
   * @param {string} triggerType - e.g., 'new_lead', 'fee_overdue'
   * @param {object} data - Contextual data (student, lead, branch_id)
   */
  async processTrigger(triggerType, data) {
    try {
      // 1. Fetch active rules for this trigger
      const rules = await Rule.findAll({
        where: { trigger_type: triggerType, is_active: true }
      });

      for (const rule of rules) {
        await this.executeRule(rule, data);
      }
    } catch (error) {
      console.error(`Automation Error [${triggerType}]:`, error);
    }
  }

  /**
   * Execute a specific rule
   */
  async executeRule(rule, data) {
    const message = this.parseTemplate(rule.template, data);

    switch (rule.action_type) {
      case 'create_notification':
        await Notification.create({
          user_id: data.user_id,
          branch_id: data.branch_id,
          title: rule.name,
          message: message,
          type: 'alert'
        });
        break;
      
      case 'send_sms':
        // Integration with SMS Gateway would go here
        console.log(`[SIMULATED SMS to ${data.phone}]: ${message}`);
        break;

      case 'send_whatsapp':
        // Integration with WhatsApp API would go here
        console.log(`[SIMULATED WHATSAPP to ${data.phone}]: ${message}`);
        break;

      default:
        console.log(`Action ${rule.action_type} not implemented yet`);
    }
  }

  /**
   * Parse template placeholders
   */
  parseTemplate(template, data) {
    let message = template;
    const placeholders = {
      '{student_name}': data.student_name || data.name || 'Student',
      '{amount}': data.amount || '0',
      '{date}': data.date || new Date().toLocaleDateString(),
      '{batch_name}': data.batch_name || 'Batch',
      '{branch_name}': data.branch_name || 'Branch'
    };

    for (const [key, value] of Object.entries(placeholders)) {
      message = message.replace(new RegExp(key, 'g'), value);
    }

    return message;
  }
}

module.exports = new AutomationService();
