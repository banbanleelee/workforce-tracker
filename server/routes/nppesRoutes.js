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

router.post('/bulk-search', async (req, res) => {
    const { providers } = req.body;

    if (!providers || !Array.isArray(providers) || providers.length === 0) {
        return res.status(400).json({ error: 'A valid providers array is required' });
    }

    try {
        // Fetch data for each provider in parallel
        const results = await Promise.all(
            providers.map(async ({ firstName, lastName, state }) => {
                try {
                    const apiUrl = `https://npiregistry.cms.hhs.gov/api/?version=2.1&first_name=${firstName}&last_name=${lastName}&state=${state}&limit=200`;
                    const response = await axios.get(apiUrl);

                    if (!response.data.results || response.data.results.length === 0) {
                        return { error: `No results found for ${firstName} ${lastName} in ${state}` };
                    }

                    return response.data.results.map((result) => {
                        const locationAddress = result.addresses?.find(addr => addr.address_purpose === "LOCATION") || {};
                        const primaryTaxonomy = result.taxonomies?.find(tax => tax.primary === true) || {};
                        const otherNames = result.other_names?.map((name) => `${name.type} ${name.organization_name}`).join(', ') || '';
                        const basic = result.basic || {};

                        return {
                            npi: result.number || 'N/A',
                            type: result.enumeration_type || 'N/A',
                            organizationName: basic.organization_name || 'N/A',
                            address1: locationAddress.address_1 || 'N/A',
                            address2: locationAddress.address_2 || 'N/A',
                            city: locationAddress.city || 'N/A',
                            state: locationAddress.state || 'N/A',
                            zip: locationAddress.postal_code?.substring(0, 5) || 'N/A',
                            telephoneNumber: locationAddress.telephone_number || 'N/A',
                            taxonomyCode: primaryTaxonomy.code || 'N/A',
                            taxonomyDesc: primaryTaxonomy.desc || 'N/A',
                            credential: basic.credential || 'N/A',
                            sex: basic.sex || 'N/A',
                            firstName: basic.first_name || 'N/A',
                            lastName: `${basic.last_name || ''} ${basic.name_suffix || ''}`.trim(),
                            otherNames: otherNames,
                        };
                    });
                } catch (error) {
                    console.error(`Error fetching data for ${firstName} ${lastName}:`, error.message);
                    return { error: `Error fetching data for ${firstName} ${lastName}` };
                }
            })
        );

        res.status(200).json({ results: results.flat() });
    } catch (error) {
        console.error('Error fetching data from NPPES:', error.message);
        res.status(500).json({ error: 'Error fetching data from NPPES' });
    }
});

module.exports = router;
