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
} from '@chakra-ui/react';

const ProviderDirectory = () => {
  const toast = useToast();

  const NPPES_API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/nppes/search`;

  const [nppesResults, setNppesResults] = useState([]);
  const [pastedNPIs, setPastedNPIs] = useState('');

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
          const basic = result.basic || {};

          return {
            npi: result.number || '',
            type: result.enumeration_type || '',
            organizationName: basic.organization_name || '', // Fallback to practitioner's name
            address1: address.address_1 || '',
            address2: address.address_2 || '',
            city: address.city || '',
            state: address.state || '',
            zip: address.postal_code?.substring(0, 5) || '',
            telephoneNumber: address.telephone_number || '',
            taxonomyCode: taxonomy.code || '',
            taxonomyDesc: taxonomy.desc || '',
            credential: basic.credential || '',
            gender: basic.gender || '',
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

  // Handle pasted NPIs
  const handlePasteNPIs = async () => {
    const npis = pastedNPIs.split('\n').map((npi) => npi.trim()).filter(npi => npi !== '');
    for (const npi of npis) {
      await fetchNPI(npi);
    }
  };

  // Handle input change
  const handleInputChange = (event) => {
    setPastedNPIs(event.target.value);
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
