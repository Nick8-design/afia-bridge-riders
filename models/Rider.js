const { DataTypes } = require("sequelize");
const { sequelize } = require("../database/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    role: {
      type: DataTypes.ENUM("patient", "doctor", "pharmacist", "rider", "admin"),
      allowNull: false,
      index: true,
    },

    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone_number: {
      type: DataTypes.STRING,
      unique: true,
    },

    profile_image: {
      type: DataTypes.STRING,
    },

    initials: {
      type: DataTypes.STRING,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    two_factor_method: {
      type: DataTypes.ENUM("sms", "email", "app"),
      defaultValue: "sms",
    },

    two_factor_phone: {
      type: DataTypes.STRING,
    },

    last_password_change: {
      type: DataTypes.DATE,
    },

    last_login: {
      type: DataTypes.DATE,
    },

    account_status: {
      type: DataTypes.ENUM("active", "suspended", "locked", "disabled"),
      defaultValue: "active",
    },

    status_reason: {
      type: DataTypes.STRING,
    },

    bio: {
      type: DataTypes.TEXT,
    },

    gender: {
      type: DataTypes.STRING,
    },

    date_of_birth: {
      type: DataTypes.STRING,
    },

    age: {
      type: DataTypes.INTEGER,
    },

    blood_type: {
      type: DataTypes.STRING,
    },

    address: {
      type: DataTypes.STRING,
    },

    provider_sharing: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    research_opt_in: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    emergency_contacts: {
      type: DataTypes.JSON,
    },

    allergies: {
      type: DataTypes.JSON,
    },

    surgeries: {
      type: DataTypes.JSON,
    },

    visits: {
      type: DataTypes.JSON,
    },

    conditions: {
      type: DataTypes.JSON,
    },

    documents: {
      type: DataTypes.JSON,
    },

    specialty: {
      type: DataTypes.STRING,
    },

    kmpdc_license: {
      type: DataTypes.STRING,
    },

    hospital: {
      type: DataTypes.STRING,
    },

    consultation_fee: {
      type: DataTypes.FLOAT,
    },

    allow_video_consultations: {
      type: DataTypes.BOOLEAN,
    },

    allow_in_person_consultations: {
      type: DataTypes.BOOLEAN,
    },

    working_hours: {
      type: DataTypes.JSON,
    },

    slot_duration: {
      type: DataTypes.INTEGER,
    },

    auto_confirm_appointments: {
      type: DataTypes.BOOLEAN,
    },

    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    total_reviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    verification_status: {
      type: DataTypes.ENUM(
        "pending_verification",
        "verified",
        "rejected"
      ),
    },

    verified_at: {
      type: DataTypes.DATE,
    },

    verified_by: {
      type: DataTypes.STRING,
    },

    national_id: {
      type: DataTypes.STRING,
    },

    vehicle_type: {
      type: DataTypes.STRING,
    },

    plate_number: {
      type: DataTypes.STRING,
    },

    driving_license_no: {
      type: DataTypes.STRING,
    },

    license_expiry: {
      type: DataTypes.DATE,
    },

    id_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    license_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    approved_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
    },

    date_approved: {
      type: DataTypes.DATE,
    },

    on_duty: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    emergency_contact: {
      type: DataTypes.STRING,
    },

    orders_made: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    verified_by_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    pharmacy_id: {
      type: DataTypes.UUID,
    },
    gps_lat: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    gps_lng: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

module.exports = User;