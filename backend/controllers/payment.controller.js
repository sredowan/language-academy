const Transaction = require('../models/Transaction');
const Student = require('../models/Student');
const { v4: uuidv4 } = require('uuid');

const simulatePayment = async (req, res) => {
  try {
    const { method, amount } = req.body;
    const user = req.user;

    if (!amount || amount !== 2500) {
      return res.status(400).json({ error: 'Invalid payment amount. Premium plan costs 2500 BDT.' });
    }

    const validMethods = ['bkash', 'amarpay', 'sslcommerz', 'surjopay', 'card', 'bank_transfer', 'nagad'];
    if (!validMethods.includes(method?.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid payment method.' });
    }

    // Since it's a simulation, we immediately mark it as success
    const student = await Student.findOne({ where: { user_id: user.id } });
    if (!student) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    // Calculate expiry (+90 days)
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + 90);

    // Update Student record for Premium plan
    await student.update({
      plan_type: 'premium',
      premium_start_date: startDate,
      premium_expiry_date: expiryDate,
      active_devices: [] // reset active devices on new subscription
    });

    // Create an Accounting transaction hook
    // We assume the student branch and enrollment if applicable. 
    // To satisfy the DB schema (Transaction requires branch_id, amount, method, status...)
    let parsedMethod = method.toLowerCase();
    if (parsedMethod === 'amarpay' || parsedMethod === 'sslcommerz' || parsedMethod === 'surjopay') {
      parsedMethod = 'card';
    }

    const transaction = await Transaction.create({
      branch_id: student.branch_id,
      amount: 2500,
      method: parsedMethod,
      transaction_ref: `SIM-${uuidv4().substring(0, 8).toUpperCase()}`,
      status: 'success',
      paid_at: new Date(),
      recorded_by: user.id // using student user as recorder for simulation self-service
    });

    res.status(200).json({
      message: 'Payment successful. Upgraded to Premium Plan.',
      plan_type: 'premium',
      premium_expiry_date: expiryDate,
      transaction_id: transaction.id
    });
  } catch (error) {
    console.error('Payment Simulation Error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
};

module.exports = {
  simulatePayment
};
