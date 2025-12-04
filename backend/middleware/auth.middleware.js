import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// =====================
// PROTECT ROUTE
// =====================
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// =====================
// ROLE CHECKERS
// =====================
export const isHacker = (req, res, next) => {
  if (req.user && req.user.role === 'hacker') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Hacker role required.' });
  }
};

export const isCompany = (req, res, next) => {
  if (req.user && req.user.role === 'company') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Company role required.' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

export const isCompanyOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'company' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Company or Admin role required.' });
  }
};

// =====================
// DYNAMIC ROLE AUTHORIZER
// =====================
// Fix for your error: now extras.routes.js can import it
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not allowed to access this resource"
      });
    }
    next();
  };
};
