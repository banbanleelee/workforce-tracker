import React, { useEffect, useState } from 'react';
import { useProviderContext } from '../context/ProviderContext';
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
  VStack,
  Button,
  HStack,
  useToast,
} from '@chakra-ui/react';

const ProviderDirectory = () => {
  const { tinQueries, staticNPIs } = useProviderContext();
  const toast = useToast();

  const HIPAA_API_BASE_URL = 'https://www.hipaaspace.com/api/ein/getcodes';
  const HIPAA_API_TOKEN = '124ADC7D37A24F64AD81934F03FE1834EFEDA1903D894F349A6DC3FE506DC1CF';
  const NPPES_API_BASE_URL = 'http://localhost:5000/api/nppes/search';

  const [hipaaResults, setHipaaResults] = useState([]);
  const [nppesResults, setNppesResults] = useState([]);
  const [currentView, setCurrentView] = useState('HIPAA'); // 'HIPAA' or 'NPPES'

  // Fetch provider data from HIPAASpace
  const fetchProviderDetails = async () => {
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < tinQueries.length; i += batchSize) {
      const batch = tinQueries.slice(i, i + batchSize);
      try {
        const response = await axios.get(
          `${HIPAA_API_BASE_URL}?&q=${batch.join(',')}&rt=json&token=${HIPAA_API_TOKEN}`
        );

        if (response.data.EIN && Array.isArray(response.data.EIN)) {
          const extractedDetails = response.data.EIN.map((entry) => ({
            conformedName: entry.CONFORMED_NAME || '',
            city: entry.BUSINESS_ADDRESS_CITY || '',
            state: entry.BUSINESS_ADDRESS_STATE || '',
            zip: entry.BUSINESS_ADDRESS_ZIP ? entry.BUSINESS_ADDRESS_ZIP.split('-')[0] : '',
          }));
          results.push(...extractedDetails);
        } else {
          toast({
            title: 'HIPAASpace Fetch Warning',
            description: 'No EIN data found in the HIPAASpace response.',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: 'Error Fetching HIPAASpace Data',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }

    setHipaaResults(results);
  };

  // Fetch NPI from NPPES API
const fetchNPI = async (npi) => {
    try {
      const apiUrl = `${NPPES_API_BASE_URL}?number=${npi}`;
      const response = await axios.get(apiUrl);
  
      if (response.data.results) {
        const extractedResults = response.data.results.map((result) => {
          const address = result.addresses?.[0] || {};
          const taxonomy = result.taxonomies?.[0] || {};
          const otherNames = result.other_names?.map((name) => `${name.type} ${name.organization_name}`).join(', ') || '';
  
          return {
            npi: result.number || '',
            organizationName: result.basic?.organization_name || '',
            address1: address.address_1 || '',
            city: address.city || '',
            state: address.state || '',
            zip: address.postal_code?.substring(0, 5) || '',
            telephoneNumber: address.telephone_number || '',
            taxonomyCode: taxonomy.code || '',
            taxonomyDesc: taxonomy.desc || '',
            otherNames: otherNames,
          };
        });
  
        // Deduplicate results before setting state
        setNppesResults((prevResults) => {
          const combinedResults = [...prevResults, ...extractedResults];
          const uniqueResults = combinedResults.filter(
            (item, index, self) => 
              index === self.findIndex((t) => t.npi === item.npi)
          );
          return uniqueResults;
        });
      } else {
        toast({
          title: `No Results Found for NPI ${npi}`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: `Error Fetching NPI for ${npi}`,
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  

  // Fetch all NPIs
  const fetchAllNPIs = async () => {
    for (const npi of staticNPIs) {
      await fetchNPI(npi);
    }
  };

  // Initial data fetching
  useEffect(() => {
    if (tinQueries.length > 0) {
      fetchProviderDetails();
    }
    fetchAllNPIs();
  }, [tinQueries]);

  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={6}>
        Provider Directory
      </Heading>

      {/* Toggle Buttons */}
      <HStack spacing={4} mb={6}>
        <Button
          colorScheme={currentView === 'HIPAA' ? 'blue' : 'gray'}
          onClick={() => setCurrentView('HIPAA')}
        >
          By TIN
        </Button>
        <Button
          colorScheme={currentView === 'NPPES' ? 'green' : 'gray'}
          onClick={() => setCurrentView('NPPES')}
        >
          BY NPI
        </Button>
      </HStack>

      {/* HIPAASpace Results */}
      {currentView === 'HIPAA' && (
        <Box>
          <Heading as="h2" size="md" mb={4}>
            HIPAASpace Database (Token expired)
          </Heading>
          <Table variant="striped" colorScheme="blue">
            <Thead>
              <Tr>
                <Th>Conformed Name</Th>
                <Th>City</Th>
                <Th>State</Th>
                <Th>Zip</Th>
              </Tr>
            </Thead>
            <Tbody>
              {hipaaResults.map((result, index) => (
                <Tr key={index}>
                  <Td>{result.conformedName}</Td>
                  <Td>{result.city}</Td>
                  <Td>{result.state}</Td>
                  <Td>{result.zip}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* NPPES Results */}
      {currentView === 'NPPES' && (
        <Box>
          <Heading as="h2" size="md" mb={4}>
            NPPES Database
          </Heading>
          <Table variant="striped" colorScheme="green">
            <Thead>
              <Tr>
                <Th>NPI</Th>
                <Th>Organization Name</Th>
                <Th>Address 1</Th>
                <Th>City</Th>
                <Th>State</Th>
                <Th>Zip</Th>
                <Th>Telephone Number</Th>
                <Th>Taxonomy Code</Th>
                <Th>Taxonomy Description</Th>
                <Th>Other Names</Th>
              </Tr>
            </Thead>
            <Tbody>
              {nppesResults.map((result, index) => (
                <Tr key={index}>
                  <Td>{result.npi}</Td>
                  <Td>{result.organizationName}</Td>
                  <Td>{result.address1}</Td>
                  <Td>{result.city}</Td>
                  <Td>{result.state}</Td>
                  <Td>{result.zip}</Td>
                  <Td>{result.telephoneNumber}</Td>
                  <Td>{result.taxonomyCode}</Td>
                  <Td>{result.taxonomyDesc}</Td>
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

export default ProviderDirectory;
