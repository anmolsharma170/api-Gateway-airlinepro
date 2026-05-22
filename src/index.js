const express = require('express');
const {ServerConfig, Logger} = require('./config');
const apiRoutes = require('./routes');
const app = express(); 
const  rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const serverConfig = require('./config/server-config');

const limiter = rateLimit({
    windowMs: 2*60*1000,    // in every 2min window we can send max 3 req
    max:30
})

app.use(limiter); //rate limiter limits each IP address

// setting up proxy
app.use('/flightService',createProxyMiddleware({
    target: ServerConfig.FLIGHT_SERVICE, 
    changeOrigin: true,
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
