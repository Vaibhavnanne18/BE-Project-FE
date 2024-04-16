const jwt = require('jsonwebtoken');
const User = require('../models/user')
const mongoose = require('mongoose');

exports.verifyToken = async (req, res, next) => {
  if (req.headers['authorization']) {
    try {
      console.log("Req Header : ", req.headers);
      const token = req.headers['authorization'];
      if (!token.startsWith('Bearer ')) {
        throw new Error('Invalid token format');
      }
      const decoded = await jwt.verify(token.split(' ')[1], 'FGMFRKGMVBFMKBMFOKBMBKMGKGDLMVFKDMBFLKBMGKBGISS');
      console.log("Decoded :", decoded);
      if (!decoded.hasOwnProperty('_id')) {
        throw new Error('Invalid token: Missing _id');
      }
      if (!mongoose.Types.ObjectId.isValid(decoded['_id'])) {
        throw new Error('_id is not valid');
      }
      res.locals._id = decoded['_id'];
      console.log("Verification of token Success");
      return next();
    } catch (e) {
      console.log("Verification of token failed:", e.message);
      return res.status(401).json({ error: e.message });
    }
  } else {
    console.log("Verification of token Skipped");
    return next();
  }
};

exports.checkIfAdminSignedIn = async (req, res, next) => {
  if (!res.locals._id) return res.status(401).send('Unauthorized');
  const user = await User.findById(res.locals._id).exec();
  if (user === null) return res.status(401).send('Unauthorized');
  if (user.type !== 'ADMIN') return res.status(401).send('Unauthorized');
  return next();
};

exports.checkIfAdminOrUserSignedIn = async (req, res, next) => {
  if (!res.locals._id) return res.status(401).send('Unauthorized');
  const user = await User.findById(res.locals._id).exec();
  if (user === null) return res.status(401).send('Unauthorized');
  if (user.type !== 'ADMIN') {
    if (req.params['_id'] !== res.locals._id) return res.status(401).send('Unauthorized');
  }
  return next();
};

exports.checkUserSignedIn = async (req, res, next) => {
  if (!res.locals._id) return res.status(401).send('Unauthorized');
  return next();
};