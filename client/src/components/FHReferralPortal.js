import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Heading, Button, Input, Textarea, Select, Table, Thead, Tbody, Tr, Th, Td, useToast, Spinner, useDisclosure,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter
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
  const [daysThreshold, setDaysThreshold] = useState(() => localStorage.getItem('referralThreshold') || '');
  const [includeResolved, setIncludeResolved] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [confirmLabel, setConfirmLabel] = useState('');

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/referrals`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setReferrals(res.data);
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

  const handleSubmit = () => {
    if (!form.csiId) {
      toast({ title: 'CSI ID is required', status: 'warning' });
      return;
    }

    if (editingId) {
      setConfirmLabel('Update');
      setConfirmAction(() => async () => {
        try {
          const token = localStorage.getItem('authToken');
          await axios.put(`${API_BASE_URL}/api/referrals/${editingId}`, form, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast({ title: 'Referral updated', status: 'success' });
          setEditingId(null);
          setForm({ issueType: '', csiId: '', fhIssueId: '', fileLink: '', status: 'In progress', notes: '' });
          fetchReferrals();
        } catch (err) {
          toast({ title: 'Error updating referral', status: 'error' });
        }
      });
      onOpen();
    } else {
      setConfirmLabel('Submit');
      setConfirmAction(() => async () => {
        try {
          const token = localStorage.getItem('authToken');
          await axios.post(`${API_BASE_URL}/api/referrals`, form, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast({ title: 'Referral created', status: 'success' });
          setForm({ issueType: '', csiId: '', fhIssueId: '', fileLink: '', status: 'In progress', notes: '' });
          fetchReferrals();
        } catch (err) {
          toast({ title: 'Error saving referral', status: 'error' });
        }
      });
      onOpen();
    }
  };

  const handleEdit = (referral) => {
    setEditingId(referral._id);
    setForm({ ...referral });
  };

  const handleDelete = (id) => {
    setConfirmLabel('Delete');
    setConfirmAction(() => async () => {
      try {
        await axios.delete(`${API_BASE_URL}/api/referrals/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        toast({ title: 'Referral deleted', status: 'info' });
        fetchReferrals();
      } catch (err) {
        toast({ title: 'Delete failed', status: 'error' });
      }
    });
    onOpen();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const csv = filteredReferrals.map(r => ({
      issueType: r.issueType,
      csiId: r.csiId,
      fhIssueId: r.fhIssueId,
      fileLink: r.fileLink,
      status: r.status,
      notes: r.notes,
      createdBy: `${r.createdBy?.firstName || ''} ${r.createdBy?.lastName || ''}`.trim(),
      createdAt: r.createdAt ? moment(r.createdAt).format('MM/DD/YYYY') : '',
      updatedAt: r.updatedAt ? moment(r.updatedAt).format('MM/DD/YYYY') : '',
      daysOpen: moment().diff(moment(r.createdAt), 'days'),
      daysStale: moment().diff(moment(r.updatedAt), 'days'),
    }));

    if (csv.length === 0) return;

    const headers = Object.keys(csv[0]);
    const rows = csv.map(row => headers.map(h => `"${row[h] || ''}"`).join(','));
    const content = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `filtered_referrals_${Date.now()}.csv`;
    link.click();
  };

  const filteredReferrals = referrals
    .map(r => ({
      ...r,
      daysOpen: moment().diff(moment(r.createdAt), 'days'),
      daysStale: moment().diff(moment(r.updatedAt), 'days'),
    }))
    .filter(r => {
      const meetsAge = !daysThreshold || r.daysStale >= Number(daysThreshold);
      const meetsStatus = includeResolved || r.status === 'In progress';
      return meetsStatus && meetsAge;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let aVal = a[sortField], bVal = b[sortField];
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aVal = new Date(aVal); bVal = new Date(bVal);
      }
      return sortDirection === 'asc'
        ? aVal > bVal ? 1 : -1
        : aVal < bVal ? 1 : -1;
    });

  return (
    <Box maxW="95%" mx="auto" mt={10} p={5}>
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

      <Box mb={4} display="flex" gap={4} alignItems="center">
        <Input
          type="number"
          value={daysThreshold}
          onChange={(e) => {
            setDaysThreshold(e.target.value);
            localStorage.setItem('referralThreshold', e.target.value);
          }}
          placeholder="Show issues not updated in N days"
          width="300px"
        />
        <Button onClick={() => setDaysThreshold('')}>Reset Filter</Button>
        <label>
          <input
            type="checkbox"
            checked={includeResolved}
            onChange={(e) => setIncludeResolved(e.target.checked)}
            style={{ marginRight: '5px' }}
          />
          Include Resolved
        </label>
        <Button onClick={exportToCSV} colorScheme="green">
          Export Filtered to CSV
        </Button>
      </Box>

      <Box mb={2} fontWeight="bold">
        Showing {filteredReferrals.length} matching {includeResolved ? 'records' : 'in-progress issues'}
      </Box>

      {loading ? (
        <Spinner />
      ) : (
        <Box overflowX="auto" maxHeight="600px" overflowY="auto">
          <Table size="sm" variant="striped" colorScheme="teal" position="relative">
            <Thead position="sticky" top={0} bg="gray.200" zIndex={1}>
              <Tr>
                {['issueType', 'csiId', 'fhIssueId', '', 'status', '', '', 'createdAt', 'updatedAt', 'daysOpen', 'daysStale', ''].map((field, i) => (
                  <Th key={i} cursor={field ? 'pointer' : 'default'} onClick={field ? () => handleSort(field) : undefined}>
                    {['Issue Type', 'CSI ID', 'FH Issue ID', 'File Link', 'Status', 'Notes', 'Created By', 'Created', 'Updated', 'Days Open', 'Days Stale', 'Actions'][i]}
                    {field === sortField && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {filteredReferrals.map(r => (
                <Tr key={r._id}>
                  <Td>{r.issueType}</Td>
                  <Td>{r.csiId}</Td>
                  <Td>{r.fhIssueId}</Td>
                  <Td><a href={r.fileLink} target="_blank" rel="noreferrer">View</a></Td>
                  <Td>{r.status}</Td>
                  <Td>{r.notes}</Td>
                  <Td>{r.createdBy?.firstName} {r.createdBy?.lastName}</Td>
                  <Td>{r.createdAt ? moment(r.createdAt).format('MM/DD/YYYY') : ''}</Td>
                  <Td>{r.updatedAt ? moment(r.updatedAt).format('MM/DD/YYYY') : ''}</Td>
                  <Td>{r.daysOpen}</Td>
                  <Td>{r.daysStale}</Td>
                  <Td>
                    <Button size="xs" colorScheme="yellow" onClick={() => handleEdit(r)} mr={2}>Edit</Button>
                    <Button size="xs" colorScheme="red" onClick={() => handleDelete(r._id)}>Delete</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm {confirmLabel}
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to {confirmLabel.toLowerCase()} this referral?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>Cancel</Button>
              <Button colorScheme={confirmLabel === 'Delete' ? 'red' : 'yellow'} onClick={() => {
                confirmAction();
                onClose();
              }} ml={3}>
                Yes, {confirmLabel}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default FHReferralPortal;
