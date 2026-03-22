const DeliveryTask = require("../models/DeliveryTask");
const Order = require("../models/Order");
const User = require("../models/Rider");
const Pharmacy = require("../models/Pharmacies");


// const DeliveryTask = require("./DeliveryTask");
// const Order = require("./Order");
// const User = require("./User");
// const Pharmacy = require("./Pharmacy");






exports.getDeliveryFullDetails = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await DeliveryTask.findByPk(deliveryId, {
      include: [
        {
          model: Order,
          as: "order",
          include: [
            {
              model: User,
              as: "patient",
              attributes: [
                "id",
                "full_name",
                "phone_number",
                "email",
                "address"
              ]
            },
            {
              model: Pharmacy,
              as: "pharmacy"
            }
          ]
        }
      ]
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found"
      });
    }

    res.json({
      success: true,
      data: delivery
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


exports.getPharmacyById = async (req, res) => {
    try {
      const pharmacy = await Pharmacy.findByPk(req.params.pharmacyId);
  
      if (!pharmacy) {
        return res.status(404).json({
          success: false,
          message: "Pharmacy not found"
        });
      }
  
      res.json({
        success: true,
        data: pharmacy
      });
  
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  };


  exports.getPatientById = async (req, res) => {
    try {
      const patient = await User.findOne({
        where: {
          id: req.params.patientId,
          role: "patient"
        },
        attributes: [
          "id",
          "full_name",
          "phone_number",
          "email",
          "address",
          "profile_image"
        ]
      });
  
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found"
        });
      }
  
      res.json({
        success: true,
        data: patient
      });
  
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  };

