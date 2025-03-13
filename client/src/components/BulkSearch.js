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
  Spinner,
} from '@chakra-ui/react';

const BulkSearch = () => {
  const toast = useToast();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  const NPPES_API_BASE_URL = `${API_BASE_URL}/api/nppes/bulk-search`;

  const [pastedData, setPastedData] = useState('');
  const [providerResults, setProviderResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProviders = async (providers) => {
    setLoading(true);
    setProviderResults([]);

    console.log(`🔍 Initiating search for ${providers.length} providers...`);
    console.log(`➡️ Request Payload:`, providers);

    try {
      console.log(`🛠 Sending POST request to: ${NPPES_API_BASE_URL}`);

      const response = await axios.post(NPPES_API_BASE_URL, { providers });

      if (response.data.results && response.data.results.length > 0) {
        console.log(`✅ Received ${response.data.results.length} results`);
        console.log(`📄 API Response Data:`, response.data.results);

        setProviderResults(response.data.results);
      } else {
        console.warn(`⚠️ No results found`);
        toast({
          title: 'No results found',
          description: 'No providers matched your search.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(`❌ Error fetching data:`, error.message);
      toast({
        title: 'Error fetching data',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }

    setLoading(false);
  };

  const handleProcessData = async () => {
    setProviderResults([]);

    console.log(`📥 Raw Pasted Data:`, pastedData);

    // ✅ Split input into individual words (splitting on spaces)
    const words = pastedData.trim().split(/\s+/); 

    console.log(`📝 Split Words:`, words);

    // ✅ Process words in groups of 3 (First Name, Last Name, State)
    const providers = [];
    for (let i = 0; i < words.length; i += 3) {
        if (i + 2 < words.length) {
            providers.push({
                lastName: words[i],
                firstName: words[i + 1],
                state: words[i + 2].toUpperCase(),
            });
        }
    }

    console.log(`📌 Parsed Providers:`, providers);
    console.log(`🛠 Total Providers Parsed: ${providers.length}`);

    if (providers.length === 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter names in sets of three (First Name, Last Name, State).',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await fetchProviders(providers);
};

  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={6}>
        Bulk Provider Search
      </Heading>
      <Box mb={4}>
        <Input
          type="text"
          placeholder="Paste names & states (each line: First Last State)"
          value={pastedData}
          onChange={(e) => setPastedData(e.target.value)}
        />
        <Button mt={2} colorScheme="teal" onClick={handleProcessData} isLoading={loading}>
          {loading ? <Spinner size="sm" /> : 'Search Providers'}
        </Button>
      </Box>

      {providerResults.length > 0 && (
        <Box>
          <Table variant="striped" colorScheme="green">
            <Thead>
              <Tr>
                <Th>NPI</Th>
                <Th>Type</Th>
                <Th>First Name</Th>
                <Th>Last Name</Th>
                <Th>Organization</Th>
                <Th>City</Th>
                <Th>State</Th>
                <Th>Phone</Th>
                <Th>Taxonomy</Th>
                <Th>Taxonomy Description</Th>
                <Th>Credential</Th>
                <Th>Sex</Th>
              </Tr>
            </Thead>
            <Tbody>
              {providerResults.map((result, index) => (
                <Tr key={index}>
                  <Td>{result.npi}</Td>
                  <Td>{result.type}</Td>
                  <Td>{result.firstName}</Td>
                  <Td>{result.lastName}</Td>
                  <Td>{result.organizationName}</Td>
                  <Td>{result.city}</Td>
                  <Td>{result.state}</Td>
                  <Td>{result.telephoneNumber}</Td>
                  <Td>{result.taxonomyCode}</Td>
                  <Td>{result.taxonomyDesc}</Td>
                  <Td>{result.credential ? result.credential.replace(/\./g, '') : 'N/A'}</Td>
                  <Td>{result.sex}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default BulkSearch;
