const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./database/db');

const riderRoutes = require('./routes/riderRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supportRoutes = require('./routes/supportRoutes');
const financeRoutes = require('./routes/financeRoutes');

const { protect } = require('./middleware/auth');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const logger = require('./middleware/logger');
const adminRoutes = require('./routes/adminRoutes');


// 1. Load Environment Variables
dotenv.config();

// 2. Connect to MongoDB Atlas
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