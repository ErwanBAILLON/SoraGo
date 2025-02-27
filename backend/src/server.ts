import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
