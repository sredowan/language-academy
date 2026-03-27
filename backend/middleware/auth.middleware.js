const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Branch = require('../models/Branch');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Initial fetch to get the user and role
    let user = await User.findOne({ 
      where: { id: decoded.id },
      include: [Branch]
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // If student, include student profile for premium status
    if (user.role === 'student') {
      const Student = require('../models/Student');
      user = await User.findOne({
        where: { id: user.id },
        include: [Branch, { model: Student }]
      });
    }

    req.user = user;
    req.branchId = user.branch_id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Aliases for better readability in routes
const protect = authMiddleware;
const authorize = roleMiddleware;

module.exports = { authMiddleware, roleMiddleware, protect, authorize };
