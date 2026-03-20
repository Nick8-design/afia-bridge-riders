// const express = require('express');
// const app = express();
// app.use(express.json());

/**
 * POST /api/verify-id
 * Payload: { "name": "string", "idNumber": "string" }
 */
// app.post('/api/verify-id', (req, res) => {
//     const { name, idNumber } = req.body;

//     // 1. Basic Validation
//     if (!name || !idNumber) {
//         return res.status(400).json({
//             success: false,
//             message: "Validation Failed: Name and ID Number are required."
//         });
//     }

//     // 2. Business Logic (Example: check length)
//     if (idNumber.length < 6) {
//         return res.status(422).json({
//             success: false,
//             message: "Invalid ID format."
//         });
//     }

//     // 3. Success Response
//     console.log(`Received verification for: ${name} (${idNumber})`);
//     res.status(200).json({
//         success: true,
//         message: "Data received and validated successfully."
//     });
// });

// app.post("/verify-id", (req, res) => {

//     const { name, idNumber } = req.body;

//     if (!name || !idNumber) {

//         return res.status(400).json({
//             success: false,
//             message: "Missing required fields"
//         });

//     }

//     return res.json({
//         success: true,
//         message: "ID verified successfully"
//     });

// });



// // Handle 404
// app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server active on port ${PORT}`));

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./database/db');

const riderRoutes = require('./routes/riderRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supportRoutes = require('./routes/supportRoutes');
const financeRoutes = require('./routes/financeRoutes');

const { protect } = require('./middleware/auth');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const logger = require('./middleware/logger');
const adminRoutes = require('./routes/adminRoutes');

const User = require('./models/Rider');

// 1. Load Environment Variables
dotenv.config();


connectDB();

const app = express();
app.use(logger);

// 3. Global Middleware
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static('uploads'));

app.get('/ping', (req, res) => {
  res.send('Afya Bridge Rider API is Live and Running!');
});

// Verification Check Endpoint
app.post('/check-verification', async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Basic Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required."
      });
    }

   

    
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      attributes: ['full_name', 'email', 'is_verified', 'approved_status']
    });

    // 3. Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // 4. Return Verification Status
    res.status(200).json({
      success: true,
      data: {
        name: user.full_name,
        email: user.email,
        is_verified: user.is_verified,
        approved: user.approved_status
      }
    });

  } catch (error) {
    console.error('Verification Check Error:', error);
    res.status(500).json({
      success: false,
      message: "Server Error during verification check."
    });
  }
});



app.use('/api/riders', riderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/admin', adminRoutes);


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});