const express = require("express");
const router = express.Router();

const {
  getDeliveryFullDetails,
  getPharmacyById,
  getPatientById
} = require("../controllers/deliveryController");

const { protect } = require("../middleware/auth");

// MAIN endpoint (your requirement)
router.get("/full/:deliveryId", protect, getDeliveryFullDetails);

// Extra endpoints
router.get("/pharmacy/:pharmacyId", protect, getPharmacyById);
router.get("/patient/:patientId", protect, getPatientById);

module.exports = router;