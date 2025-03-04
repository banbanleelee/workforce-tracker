import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Button,
  useToast,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

const ProviderDirectory = () => {
  const toast = useToast();
  const NPPES_API_BASE_URL = 'https://npiregistry.cms.hhs.gov/api/'; // Base URL

  const [nppesResults, setNppesResults] = useState([]);
  const [pastedNPIs, setPastedNPIs] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [state, setState] = useState('');

  // Function to handle changes in the input box
  const handleInputChange = (event) => {
    // Update the pastedNPIs state with the current input value
    setPastedNPIs(event.target.value);
  };

  // Function to handle pasted NPIs
  const handlePasteNPIs = async () => {
    // Clear previous results
    setNppesResults([]);
    // Try splitting by \r\n, \r, \n, or space, and also remove non-numeric characters
    // THIS IS THE LINE THAT WAS MODIFIED
    const npis = pastedNPIs
      .split(/\r\n|\r|\n|\s+/) // Split by \r\n, \r, \n, or one or more spaces
      .map((npi) => npi.replace(/\D/g, '')) // Remove non-numeric characters
      .map((npi) => npi.trim()) // Trim whitespace
      .filter((npi) => npi !== ''); // Filter out empty strings

    // Check if any NPIs were pasted
    if (npis.length === 0) {
      toast({
        title: 'No NPIs Found',
        description: 'Please paste NPIs into the input box.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Iterate through each NPI and fetch data
    for (const npi of npis) {
      await fetchNPI(npi);
    }
  };

  // Function to fetch NPI data from the NPPES API
  const fetchNPI = async (npi) => {
    try {
      // Construct the API URL with the NPI
      const apiUrl = `${NPPES_API_BASE_URL}?number=${npi}`;
      // Make a GET request to the API
      const response = await axios.get(apiUrl);

      // Check if the API returned results
      if (response.data.results) {
        // Extract relevant data from the API response
        const extractedResults = response.data.results.map((result) => {
          // Filter addresses to only include the one with address_purpose: "LOCATION"
          const locationAddress = result.addresses?.find(addr => addr.address_purpose === "LOCATION") || {};
          // Filter taxonomies to only include the one with primary: true
          const primaryTaxonomy = result.taxonomies?.find(tax => tax.primary === true) || {};
          const otherNames = result.other_names?.map((name) => `${name.type} ${name.organization_name}`).join(', ') || '';
          const basic = result.basic || {};

          return {
            npi: result.number || '',
            type: result.enumeration_type || '',
            organizationName: basic.organization_name || '', // Fallback to practitioner's name
            address1: locationAddress.address_1 || '',
            address2: locationAddress.address_2 || '',
            city: locationAddress.city || '',
            state: locationAddress.state || '',
            zip: locationAddress.postal_code?.substring(0, 5) || '',
            telephoneNumber: locationAddress.telephone_number || '',
            taxonomyCode: primaryTaxonomy.code || '',
            taxonomyDesc: primaryTaxonomy.desc || '',
            credential: basic.credential || '',
            sex: basic.sex || '',
            firstName: basic.first_name || '',
            lastName: `${basic.last_name || ''} ${basic.name_suffix || ''}`.trim(),
            otherNames: otherNames,
          };
        });

        // Deduplicate results before setting state
        setNppesResults((prevResults) => {
          const combinedResults = [...prevResults, ...extractedResults];
          const uniqueResults = combinedResults.filter(
            (item, index, self) => index === self.findIndex((t) => t.npi === item.npi)
          );
          return uniqueResults;
        });
      } else {
        // Show a toast notification if no results are found
        toast({
          title: `No Results Found for NPI ${npi}`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      // Show a toast notification if there's an error fetching the NPI
      toast({
        title: `Error Fetching NPI for ${npi}`,
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBulkSearch = async () => {
    setNppesResults([]); // Clear previous results
    if (!firstName || !lastName || !state) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in first name, last name, and state.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    let skip = 0;
    let allResults = [];
    try {
      while (skip <= 1000) {
        const apiUrl = `${NPPES_API_BASE_URL}?version=2.1&first_name=${firstName}&last_name=${lastName}&state=${state}&limit=200&skip=${skip}`;
        const response = await axios.get(apiUrl);
        if (response.data.results && response.data.results.length > 0) {
          const extractedResults = response.data.results.map((result) => {
            const locationAddress = result.addresses?.find(addr => addr.address_purpose === "LOCATION") || {};
            const primaryTaxonomy = result.taxonomies?.find(tax => tax.primary === true) || {};
            const otherNames = result.other_names?.map((name) => `${name.type} ${name.organization_name}`).join(', ') || '';
            const basic = result.basic || {};

            return {
              npi: result.number || '',
              type: result.enumeration_type || '',
              organizationName: basic.organization_name || '',
              address1: locationAddress.address_1 || '',
              address2: locationAddress.address_2 || '',
              city: locationAddress.city || '',
              state: locationAddress.state || '',
              zip: locationAddress.postal_code?.substring(0, 5) || '',
              telephoneNumber: locationAddress.telephone_number || '',
              taxonomyCode: primaryTaxonomy.code || '',
              taxonomyDesc: primaryTaxonomy.desc || '',
              credential: basic.credential || '',
              sex: basic.sex || '',
              firstName: basic.first_name || '',
              lastName: `${basic.last_name || ''} ${basic.name_suffix || ''}`.trim(),
              otherNames: otherNames,
            };
          });
          allResults = [...allResults, ...extractedResults];
          skip += 200;
        } else {
          break; // No more results
        }
      }
      if (allResults.length === 0) {
        toast({
          title: 'No Results Found',
          description: `No providers found with the given criteria.`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setNppesResults((prevResults) => {
          const combinedResults = [...prevResults, ...allResults];
          const uniqueResults = combinedResults.filter(
            (item, index, self) => index === self.findIndex((t) => t.npi === item.npi)
          );
          return uniqueResults;
        });
      }
    } catch (error) {
      toast({
        title: 'Error Fetching Providers',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleStateChange = (event) => {
    setState(event.target.value);
  };

  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={6}>
        Provider Directory
      </Heading>

      {/* Input for Pasting NPIs */}
      <Box mb={4}>
        <Input
          type="text"
          placeholder="Paste NPIs here, each on a new line"
          value={pastedNPIs}
          onChange={handleInputChange}
        />
        <Button mt={2} colorScheme="teal" onClick={handlePasteNPIs}>
          Fetch NPIs
        </Button>
      </Box>

      {/* Input for Bulk Search */}
      <Box mb={4}>
        <FormControl>
          <FormLabel>First Name</FormLabel>
          <Input
            type="text"
            placeholder="Enter First Name"
            value={firstName}
            onChange={handleFirstNameChange}
          />
        </FormControl>
        <FormControl mt={2}>
          <FormLabel>Last Name</FormLabel>
          <Input
            type="text"
            placeholder="Enter Last Name"
            value={lastName}
            onChange={handleLastNameChange}
          />
        </FormControl>
        <FormControl mt={2}>
          <FormLabel>State</FormLabel>
          <Input
            type="text"
            placeholder="Enter State"
            value={state}
            onChange={handleStateChange}
          />
        </FormControl>
        <Button mt={2} colorScheme="teal" onClick={handleBulkSearch}>
          Bulk Search
        </Button>
      </Box>

      {/* NPPES Results */}
      <Box>
        <Heading as="h2" size="md" mb={4}>
          NPPES Database
        </Heading>
        <Table variant="striped" colorScheme="green">
          <Thead>
            <Tr>
              <Th>NPI</Th>
              <Th>Type</Th>
              <Th>Org Name</Th>
              <Th>Address1</Th>
              <Th>Address2</Th>
              <Th>City</Th>
              <Th>State</Th>
              <Th>Zip</Th>
              <Th>Telephone Number</Th>
              <Th>Taxonomy Code</Th>
              <Th>Taxonomy Description</Th>
              <Th>Credential</Th>
              <Th>Sex</Th>
              <Th>First Name</Th>
              <Th>Last Name</Th>
              <Th>Other Names</Th>
            </Tr>
          </Thead>
          <Tbody>
            {nppesResults.map((result, index) => (
              <Tr key={index}>
                <Td>{result.npi}</Td>
                <Td>{result.type}</Td>
                <Td>{result.organizationName}</Td>
                <Td>{result.address1}</Td>
                <Td>{result.address2}</Td>
                <Td>{result.city}</Td>
                <Td>{result.state}</Td>
                <Td>{result.zip}</Td>
                <Td>{result.telephoneNumber}</Td>
                <Td>{result.taxonomyCode}</Td>
                <Td>{result.taxonomyDesc}</Td>
                <Td>{result.credential}</Td>
                <Td>{result.sex}</Td>
                <Td>{result.firstName}</Td>
                <Td>{result.lastName}</Td>
                <Td>{result.otherNames}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default ProviderDirectory;
