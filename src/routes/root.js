const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

router.get('/', (req, res) => {
    db.query('SELECT COUNT(*) AS ticket_count FROM tickets')
        .then(result => {
            const ticketCount = parseInt(result.rows[0].ticket_count, 10);
            res.send(`<h1>Broj generiranih ulaznica: ${ticketCount}</h1>`);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Greška prilikom dohvaćanja broja ulaznica' });
        });
});

module.exports = router;
