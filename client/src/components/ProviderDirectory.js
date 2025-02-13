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

  // ... (existing fetchNPI and handlePasteNPIs functions)

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
              gender: basic.gender || '',
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

  // ... (existing handleInputChange function)

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
              <Th>Gender</Th>
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
                <Td>{result.gender}</Td>
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
