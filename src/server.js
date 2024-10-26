require('dotenv').config();
require('./config/db');

const {auth} = require('express-openid-connect');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const ticketRoutes = require('./routes/tickets');
const rootRoutes = require('./routes/root');

const baseURL = process.env.BASE_URL || `http://localhost:${PORT}`;

const authConfig = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_CLIENT_SECRET_OIDC,
    baseURL: baseURL,
    clientID: process.env.AUTH0_CLIENT_ID_OIDC,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
};

app.use(auth(authConfig));
app.use(express.json());
app.use('/tickets', ticketRoutes);
app.use('/', rootRoutes);

app.listen(PORT, () => {
    console.log(`Server je pokrenut na http://localhost:${PORT}`);
});