const express = require('express');
const {ServerConfig, Logger} = require('./config');
const apiRoutes = require('./routes');
const app = express(); 
const  rateLimit = require('express-rate-limit');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware'); // Added fixRequestBody to prevent proxy hanging on parsed bodies
const serverConfig = require('./config/server-config');
const { AuthRequestMiddlewares } = require('./middlewares');
const cors = require('cors'); // Added to enable CORS communication between frontend and API Gateway

// Configure CORS to allow our React client (running on http://localhost:5173) to reach the gateway
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 2*60*1000,    // in every 2min window we can send max 3 req
    max:30
})

app.use(limiter); //rate limiter limits each IP address

// --- CUSTOM CHANGE: MIDDLEWARE ORDERING ---
// Express body parsers must run before our interceptors so we can parse, inspect, 
// and inject variables (like userId and totalCost) into request bodies.
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// --- CUSTOM CHANGE: BOOKING INTERCEPTOR (CREATE) ---
// Authenticates the token and injects the user ID from JWT into the body.
app.post('/bookingService/api/v1/bookings', 
    AuthRequestMiddlewares.checkAuth,
    (req, res, next) => {
        req.body.userId = req.user; // Inject the user's ID
        next();
    }
);

// --- CUSTOM CHANGE: BOOKING INTERCEPTOR (PAYMENT) ---
// Authenticates the token, queries the shared DB for the booking's totalCost, 
// and injects both the user ID and totalCost into the body as required by Booking Service.
app.post('/bookingService/api/v1/bookings/payments',
    AuthRequestMiddlewares.checkAuth,
    async (req, res, next) => {
        try {
            const { bookingId } = req.body;
            if (!bookingId) {
                return res.status(400).json({ message: 'bookingId is required' });
            }
            
            const { sequelize } = require('./models');
            const rows = await sequelize.query('SELECT totalCost FROM bookings WHERE id = ?', {
                replacements: [bookingId],
                type: sequelize.QueryTypes.SELECT
            });
            
            if (!rows || rows.length === 0) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            
            req.body.userId = req.user; // Inject user ID
            req.body.totalCost = rows[0].totalCost; // Inject total cost from database
            next();
        } catch (err) {
            console.error('Error in gateway payments proxy interceptor:', err);
            return res.status(500).json({ message: 'Internal server error in API Gateway proxy' });
        }
    }
);

// --- CUSTOM CHANGE: BOOKING INTERCEPTOR (USER BOOKINGS) ---
// Enforces that users must be authenticated to fetch booking history.
app.get('/bookingService/api/v1/bookings/user/:userId', 
    AuthRequestMiddlewares.checkAuth,
    (req, res, next) => {
        next();
    }
);

// --- CUSTOM CHANGE: FLIGHT SERVICE PROXY WITH ROLE CHECK ---
// Authenticates write requests (POST, PUT, DELETE, PATCH) on flights 
// and forwards all requests to the Flight Service on port 4000.
app.use('/flightService', 
    (req, res, next) => {
        // Only protect write operations on flights. GET requests are open to all.
        if (req.path.startsWith('/api/v1/flights') && req.method !== 'GET') {
            AuthRequestMiddlewares.checkAuth(req, res, () => {
                AuthRequestMiddlewares.isAdminOrFlightCompany(req, res, next);
            });
        } else {
            next();
        }
    },
    createProxyMiddleware({ 
        target: ServerConfig.FLIGHT_SERVICE, 
        changeOrigin: true,
        pathRewrite: { '^/flightService': '' }, // Safe fallback in case Express doesn't strip it
        on: {
            proxyReq: fixRequestBody // Use built-in body restreamer
        }
    })
);

app.use('/bookingService',createProxyMiddleware({
    target: ServerConfig.BOOKING_SERVICE, 
    changeOrigin: true,
    pathRewrite: {'^/bookingService': ''},
    on: {
        proxyReq: fixRequestBody // Use built-in body restreamer
    }
}));

app.use('/api',apiRoutes);
app.listen(ServerConfig.PORT,()=>{
    console.log(`Successfully started the server on PORT: ${ServerConfig.PORT}`);
    Logger.info("Successfully started the server", {});
})


