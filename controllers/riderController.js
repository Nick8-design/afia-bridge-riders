const Rider = require('../models/Rider');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const Finance = require('../models/Finance');
const Notification = require('../models/Notification');
const Issue = require('../models/Issue');
const Order = require('../models/Order');


// DELETE /api/riders/delete-account
exports.deleteMyAccount = async (req, res) => {
  try {
    const riderId = req.user.id;

    await Finance.deleteOne({ userId: riderId });
    await Notification.deleteMany({ userId: riderId });
    await Issue.deleteMany({ userId: riderId });
    await Order.updateMany({ assignedRider: riderId }, { $set: { assignedRider: null } });

    await Rider.deleteOne({ _id: riderId });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// 1. Register Transporter
exports.registerTransporter = async (req, res) => {
    const { email, password, fname, lname, phnNum } = req.body;
    
    let riderExists = await Rider.findOne({ email });
    if (riderExists) return res.status(400).json({ message: "Rider already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const rider = await Rider.create({
        ...req.body,
        password: hashedPassword
    });

    res.status(201).json({ success: true, data: rider });
};



// 2. Login Rider
exports.loginRider = async (req, res) => {
    const { email, password } = req.body;
    
    // Find rider and include password for comparison
    const rider = await Rider.findOne({ email }).select('+password');

    if (rider && (await bcrypt.compare(password, rider.password))) {
        
        // --- NEW LOGIC: Record Login Time ---
        rider.lastSignedIn = new Date();
        await rider.save(); // Persists the date/time to MongoDB Atlas
        // ------------------------------------

        const token = jwt.sign({ id: rider._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        res.json({ 
            success: true, 
            token, 
            userId: rider._id,
            lastSignedIn: rider.lastSignedIn // Optional: Send it back to the frontend
        });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
};







// 3. Fetch User Data (Dashboard)
exports.fetchUserData = async (req, res) => {
    const rider = await Rider.findById(req.user.id).populate('currentTaskId');
    res.json(rider);
};

// 4. Update Profile (Deep Update for Nested Address)
exports.updateUserInformation = async (req, res) => {
    const updatedRider = await Rider.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.json(updatedRider);
};