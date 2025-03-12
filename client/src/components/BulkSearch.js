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

  // Fetch multiple providers from backend
  const fetchProviders = async (providers) => {
    setLoading(true);
    try {
      const response = await axios.post(NPPES_API_BASE_URL, { providers });

      if (response.data.results && response.data.results.length > 0) {
        setProviderResults(response.data.results);
      } else {
        toast({
          title: 'No results found',
          description: 'No providers matched your search.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        setProviderResults([]);
      }
    } catch (error) {
      toast({
        title: 'Error fetching data',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setProviderResults([]);
    }
    setLoading(false);
  };
  
  // Process pasted input
  const handleProcessData = async () => {
    setProviderResults([]);
    const providers = pastedData
      .split(/\r\n|\r|\n/)
      .map((line) => line.trim().split(/\s+/))
      .filter((parts) => parts.length >= 3)
      .map(([firstName, lastName, state]) => ({
        firstName,
        lastName,
        state: state.toUpperCase(),
      }));

    if (providers.length === 0) {
      toast({
        title: 'Invalid Input',
        description: 'Each line must have a first name, last name, and state.',
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
          <Heading as="h2" size="md" mb={4}>
            Search Results
          </Heading>
          <Table variant="striped" colorScheme="green">
            <Thead>
              <Tr>
                <Th>NPI</Th>
                <Th>Type</Th>
                <Th>First Name</Th>
                <Th>Last Name</Th>
                <Th>Organization</Th>
                <Th>Address 1</Th>
                <Th>Address 2</Th>
                <Th>City</Th>
                <Th>State</Th>
                <Th>Zip</Th>
                <Th>Phone</Th>
                <Th>Taxonomy Code</Th>
                <Th>Taxonomy Description</Th>
                <Th>Credential</Th>
                <Th>Sex</Th>
                <Th>Other Names</Th>
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
                  <Td>{result.address1}</Td>
                  <Td>{result.address2}</Td>
                  <Td>{result.city}</Td>
                  <Td>{result.state}</Td>
                  <Td>{result.zip}</Td>
                  <Td>{result.telephoneNumber}</Td>
                  <Td>{result.taxonomyCode}</Td>
                  <Td>{result.taxonomyDesc}</Td>
                  <Td>{result.credential ? result.credential.replace(/\./g, '') : 'N/A'}</Td>
                  <Td>{result.sex}</Td>
                  <Td>{result.otherNames}</Td>
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
