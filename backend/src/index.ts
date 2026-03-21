// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import { createServer } from 'http';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// dotenv.config();

// import { initWebSocket } from './lib/websocket';
// import assignmentRoutes from './routes/assignments';
// import pdfRoutes from './routes/pdf';

// const app = express();
// const server = createServer(app);

// // Middleware
// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// // app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
// app.use(cors({ origin: true, credentials: true }));
// app.use(morgan('dev'));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Routes
// app.use('/api/assignments', assignmentRoutes);
// app.use('/api/pdf', pdfRoutes);

// app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// // WebSocket
// initWebSocket(server);

// // DB
// mongoose
//   .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai')
//   .then(() => console.log('MongoDB connected'))
//   .catch(console.error);

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// export default server;


import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { initWebSocket } from './lib/websocket';
import assignmentRoutes from './routes/assignments';
import pdfRoutes from './routes/pdf';

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS - allow all origins
app.use(cors({ origin: true, credentials: true }));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/pdf', pdfRoutes);

app.get('/', (_, res) => res.json({ status: 'ok' }));
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// WebSocket
initWebSocket(server);

// DB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai')
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default server;