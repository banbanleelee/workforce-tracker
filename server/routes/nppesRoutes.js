// routes/nppesRoutes.js
const express = require('express');
const axios = require('axios');

const router = express.Router();

// Define the /search route for NPPES API
router.get('/search', async (req, res) => {
    const { number } = req.query; // Extract the "number" query parameter
    if (!number) {
        return res.status(400).json({ error: 'NPI number is required' });
    }

    const apiUrl = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${number}`;
    try {
        const response = await axios.get(apiUrl);
        res.status(200).json(response.data); // Send the NPPES API response back to the client
    } catch (error) {
        console.error('Error fetching data from NPPES:', error.message);
        res.status(500).json({ error: 'Error fetching data from NPPES' });
    }
});

module.exports = router;
