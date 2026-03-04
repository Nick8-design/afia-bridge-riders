const serviceGuard = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
  
    // Block suspended/locked
    if (req.user.accountStatus === 'Suspended') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: req.user.statusReason || 'Your account is suspended. Contact support.'
      });
    }
  
    if (req.user.accountStatus === 'Locked') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_LOCKED',
        message: req.user.statusReason || 'Your account is locked. Contact support.'
      });
    }
  
    // Block unapproved/unverified riders from services
    const isApproved = req.user.approvedStatus === 'Approved';
    if (!isApproved || req.user.idVerified !== true || req.user.lincesVerified !== true) {
      return res.status(403).json({
        success: false,
        code: 'NOT_VERIFIED',
        message: 'Your account is not verified/approved yet. Please wait for admin approval.'
      });
    }
  
    next();
  };
  
  module.exports = { serviceGuard };