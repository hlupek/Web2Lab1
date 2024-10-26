const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwtCheck = require('../authorization/auth');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { requiresAuth } = require('express-openid-connect');

router.post('/generate-ticket', jwtCheck, async (req, res) => {
    const { vatin, firstName, lastName } = req.body;

    try {
        if (!vatin || !firstName || !lastName) {
            return res.status(400).json({ error: 'Nedostaju podaci za generiranje ulaznice' });
        }

        const result = await db.query('SELECT COUNT(*) AS ticket_count FROM tickets WHERE vatin = $1', [vatin]);
        const ticketCount = parseInt(result.rows[0].ticket_count, 10);

        if (ticketCount >= 3) {
            return res.status(400).json({ error: 'Ovaj OIB već ima maksimalan broj ulaznica (3)' });
        }

        const newTicketId = uuidv4();
        const insertQuery = `INSERT INTO tickets (id, vatin, first_name, last_name, created_at)
                                    VALUES ($1, $2, $3, $4, NOW())`;
        await db.query(insertQuery, [newTicketId, vatin, firstName, lastName]);

        const protocol = req.protocol;
        const host = req.get('host');
        const qrCodeData = `${protocol}://${host}/tickets/ticket/${newTicketId}`;

        const qrCode = await QRCode.toDataURL(qrCodeData);

        res.status(201).json({ message: 'Ulaznica uspješno generirana', ticketQr: qrCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Greška prilikom generiranja ulaznice' });
    }
});

router.get('/ticket/:ticketId', requiresAuth(), async (req, res) => {
    const { ticketId } = req.params;

    try {
        const result = await db.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ulaznica nije pronađena' });
        }

        const ticket = result.rows[0];
        const formattedDate = new Date(ticket.created_at).toLocaleString();
        const userName = req.oidc.user.name;

        res.send(`<h1>Ulaznica</h1>
                  <p>ID: ${ticket.id}</p>
                  <p>OIB: ${ticket.vatin}</p>
                  <p>Ime: ${ticket.first_name}</p>
                  <p>Prezime: ${ticket.last_name}</p>
                  <p>Datum kreiranja: ${formattedDate}</p>
                  <br><br>
                  <p>Prijavljeni ste kao: ${userName}</p>
        `);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Greška prilikom dohvaćanja ulaznice' });
    }
});


module.exports = router;
