const express = require('express');
const router = express.Router();

const { adminProtect } = require('../middleware/admin');
const {
  fetchAllRiders,
  fetchOneRider,
  verifyRider,
  suspendRider,
  lockRider,
  activateRider,
  deleteRider
} = require('../controllers/adminRiderController');
const {

    adminFetchIssues,
    adminFetchOneIssue
  } = require('../controllers/supportController');
router.get('/riders', adminProtect, fetchAllRiders);
router.get('/riders/:riderId', adminProtect, fetchOneRider);

router.put('/riders/:riderId/verify', adminProtect, verifyRider);
router.put('/riders/:riderId/suspend', adminProtect, suspendRider);
router.put('/riders/:riderId/lock', adminProtect, lockRider);
router.put('/riders/:riderId/activate', adminProtect, activateRider);

router.delete('/riders/:riderId', adminProtect, deleteRider);


// Admin Issues
router.get('/admin/issues', adminProtect, adminFetchIssues);
router.get('/admin/issues/:issueId', adminProtect, adminFetchOneIssue);

module.exports = router;


