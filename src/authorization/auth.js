const {auth} = require("express-oauth2-jwt-bearer");
require('dotenv').config();

const jwtCheck = auth({
    audience: 'ticketgenerator',
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: 'RS256'
});

module.exports = jwtCheck;
