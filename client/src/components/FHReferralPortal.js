import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Button, Input, Textarea, Select, Table, Thead, Tbody, Tr, Th, Td, useToast, Spinner,
} from '@chakra-ui/react';
import axios from 'axios';
import moment from 'moment-timezone';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const FHReferralPortal = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    issueType: '',
    csiId: '',
    fhIssueId: '',
    fileLink: '',
    status: 'In progress',
    notes: '',
  });
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/referrals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setReferrals(response.data);
    } catch (err) {
      toast({ title: 'Error loading referrals', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const { issueType, csiId, fhIssueId, fileLink } = form;
    if (!issueType || !csiId ) {
      toast({ title: 'Missing required fields', status: 'warning' });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/referrals/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({ title: 'Referral updated', status: 'success' });
        setEditingId(null);
      } else {
        await axios.post(`${API_BASE_URL}/api/referrals`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({ title: 'Referral created', status: 'success' });
      }

      setForm({
        issueType: '',
        csiId: '',
        fhIssueId: '',
        fileLink: '',
        status: 'In progress',
        notes: '',
      });
      fetchReferrals();
    } catch (err) {
      toast({ title: 'Error saving referral', status: 'error' });
    }
  };

  const handleEdit = (referral) => {
    setEditingId(referral._id);
    setForm({
      issueType: referral.issueType,
      csiId: referral.csiId,
      fhIssueId: referral.fhIssueId,
      fileLink: referral.fileLink,
      status: referral.status,
      notes: referral.notes,
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/referrals/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      toast({ title: 'Referral deleted', status: 'info' });
      fetchReferrals();
    } catch (err) {
      toast({ title: 'Delete failed', status: 'error' });
    }
  };

  const handleSendDueTodayEmail = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/referrals/email-due`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      toast({ title: 'Email sent', description: res.data.message, status: 'success' });
    } catch (err) {
      toast({ title: 'Email failed', status: 'error' });
    }
  };

  return (
    <Box maxW="90%" mx="auto" mt={10} p={5}>
      <Heading mb={6}>FH Issue Referral Portal</Heading>

      <Box mb={6}>
        <Select name="issueType" value={form.issueType} onChange={handleChange} placeholder="Select Issue Type" mb={2}>
          <option value="Provider Directory">Provider Directory</option>
          <option value="Balance Billed Discount Amount">Balance Billed Discount Amount</option>
        </Select>
        <Input name="csiId" value={form.csiId} onChange={handleChange} placeholder="CSI ID (7 digits)" mb={2} />
        <Input name="fhIssueId" value={form.fhIssueId} onChange={handleChange} placeholder="FH Issue ID (8 digits)" mb={2} />
        <Input name="fileLink" value={form.fileLink} onChange={handleChange} placeholder="File Link (URL)" mb={2} />
        <Select name="status" value={form.status} onChange={handleChange} mb={2}>
          <option value="In progress">In progress</option>
          <option value="Resolved">Resolved</option>
        </Select>
        <Textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes..." mb={2} />
        <Button colorScheme="teal" onClick={handleSubmit}>
          {editingId ? 'Update' : 'Submit'} Referral
        </Button>
      </Box>

      <Box mb={4}>
        <Button onClick={handleSendDueTodayEmail} colorScheme="blue">
          Send Due Today to yzhang@tccm.org
        </Button>
      </Box>

      {loading ? (
        <Spinner />
      ) : (
        <Table size="sm" variant="striped" colorScheme="teal">
          <Thead>
            <Tr>
              <Th>Issue Type</Th>
              <Th>CSI ID</Th>
              <Th>FH Issue ID</Th>
              <Th>File Link</Th>
              <Th>Status</Th>
              <Th>Notes</Th>
              <Th>Created By</Th>
              <Th>Created</Th>
              <Th>Updated</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {referrals.map((r) => (
              <Tr key={r._id}>
                <Td>{r.issueType}</Td>
                <Td>{r.csiId}</Td>
                <Td>{r.fhIssueId}</Td>
                <Td><a href={r.fileLink} target="_blank" rel="noreferrer">View</a></Td>
                <Td>{r.status}</Td>
                <Td>{r.notes}</Td>
                <Td>{r.createdBy?.firstName} {r.createdBy?.lastName}</Td>
                <Td>{moment(r.createdAt).format('MM/DD/YYYY')}</Td>
                <Td>{moment(r.updatedAt).format('MM/DD/YYYY')}</Td>
                <Td>
                  <Button size="xs" colorScheme="yellow" onClick={() => handleEdit(r)} mr={2}>Edit</Button>
                  <Button size="xs" colorScheme="red" onClick={() => handleDelete(r._id)}>Delete</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default FHReferralPortal;
