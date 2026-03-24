const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');


const { 
    deleteMyAccount,
    registerTransporter,
    loginRider,
    fetchUserData, 
    updateUserInformation,
    getMyFinance, 
    credit,
    withdraw
} = require('../controllers/riderController');


router.delete('/delete-account', protect, deleteMyAccount);

// Registration & Login
router.post('/register', registerTransporter);
router.post('/login', loginRider);

// Dashboard & Profile
router.get('/dashboard', protect, fetchUserData);
router.put('/update-profile', protect, updateUserInformation);

// Finance (Make sure these exist in your controller)
router.get('/finance', protect, getMyFinance);
router.post('/finance/credit', protect, credit);
router.post('/finance/withdraw', protect, withdraw);

// Image Upload
// router.post('/upload-image', protect, upload.single('image'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: "Please upload a file" });
//     }

//     const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

//     res.status(200).json({
//         success: true,
//         imageUrl: fileUrl
//     });
// });

router.post('/upload-image', protect, upload.single('image'), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please upload a file"
        });
    }

    // 🔥 Get correct protocol (handles Render / proxies)
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';

    const fileUrl = `${protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
        success: true,
        imageUrl: fileUrl
    });
});

module.exports = router;