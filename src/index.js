const express = require('express');
const {ServerConfig, Logger} = require('./config');
const apiRoutes = require('./routes');
const app = express(); 
const  rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const serverConfig = require('./config/server-config');
const { AuthRequestMiddlewares } = require('./middlewares');

const limiter = rateLimit({
    windowMs: 2*60*1000,    // in every 2min window we can send max 3 req
    max:30
})

app.use(limiter); //rate limiter limits each IP address

// for Flight protection only create, update and delete routes. get routes will be open for everyone
app.use('/flightService/api/v1/flights', 
    (req, res, next) => {
        if(req.method === 'GET') {
            return next(); // Skip auth for GET requests
        }
        // Protect other methods
        AuthRequestMiddlewares.checkAuth(req, res, () => {
            AuthRequestMiddlewares.isAdminOrFlightCompany(req, res, next);
        });
    },
    createProxyMiddleware({ // 3. The proxy
        target: ServerConfig.FLIGHT_SERVICE, 
        changeOrigin:true,
        pathRewrite: {'^/flightService': ''}
    })
);

// Fallback proxy for all other unprotected routes (like getting flights)
app.use('/flightService', createProxyMiddleware({ 
    target: ServerConfig.FLIGHT_SERVICE, 
    changeOrigin:true,
    pathRewrite: {'^/flightService': ''}
}));

app.use('/bookingService',createProxyMiddleware({
    target: ServerConfig.BOOKING_SERVICE, 
    changeOrigin: true,
    pathRewrite: {'^/bookingService': ''}
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api',apiRoutes);
app.listen(ServerConfig.PORT,()=>{
    console.log(`Successfully started the server on PORT: ${ServerConfig.PORT}`);
    Logger.info("Successfully started the server", {});
})


