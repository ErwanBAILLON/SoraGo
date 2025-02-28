import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS plus permissive
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Important si vous utilisez des cookies/sessions
}));

// Middleware pour les requêtes OPTIONS préliminaires
app.options('*', cors());

app.use(bodyParser.json());

// Routes
import authRoutes from './routes/authRoutes';
import usersRoutes from './routes/usersRoutes';
import rentsRoutes from './routes/rentsRoutes';
import brandsRoutes from './routes/brandsRoutes';
import specificationsRoutes from './routes/specificationsRoutes';
import vehiclesRoutes from './routes/vehiclesRoutes';
import parkingsRoutes from './routes/parkingsRoutes';
import subscriptionPlansRoutes from './routes/subscriptionPlansRoutes';
import subscriptionsRoutes from './routes/subscriptionsRoutes';
import planVehiclesRoutes from './routes/planVehiclesRoutes';
import reservationsRoutes from './routes/reservationsRoutes';
import returnLogsRoutes from './routes/returnLogsRoutes';
import paymentsRoutes from './routes/paymentsRoutes';

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/locations', rentsRoutes);
app.use('/brands', brandsRoutes);
app.use('/specifications', specificationsRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/parkings', parkingsRoutes);
app.use('/subscription-plans', subscriptionPlansRoutes);
app.use('/subscriptions', subscriptionsRoutes);
app.use('/plan-vehicles', planVehiclesRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/return-logs', returnLogsRoutes);
app.use('/payments', paymentsRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
