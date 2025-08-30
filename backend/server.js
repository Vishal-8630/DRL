import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoute.js';
import entryRoutes from './routes/entryRoute.js';
import cookieParser from 'cookie-parser';
import billingPartyRoutes from './routes/billingPartyRoute.js';

dotenv.config();
connectDB();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
}

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entry', entryRoutes); 
app.use('/api/party', billingPartyRoutes);

// Error Handling Middleware
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
