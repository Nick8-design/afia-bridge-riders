const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const { deleteMyAccount } = require('../controllers/riderController');



const { 
    registerTransporter,
     loginRider,
      fetchUserData, 
    updateUserInformation 
} = require('../controllers/riderController');
const { protect } = require('../middleware/auth');



router.delete('/delete-account', protect, deleteMyAccount);

// Registration & Login
router.post('/register', registerTransporter);
router.post('/login', loginRider);


router.get('/dashboard', protect, fetchUserData);
router.put('/update-profile', protect, updateUserInformation);

router.post('/upload-image', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
  }

  // This is the link that will display the image
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(200).json({
      success: true,
      imageUrl: fileUrl
  });

});




module.exports = router;