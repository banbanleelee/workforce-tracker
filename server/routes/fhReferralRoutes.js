const express = require('express');
const router = express.Router();
const FHReferral = require('../models/FHReferral');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const moment = require('moment');
const nodemailer = require('nodemailer');

// Create a new referral (admin only for now)
router.post('/', verifyToken('admin'), async (req, res) => {
  try {
    const { issueType, csiId, fhIssueId, fileLink, status, notes } = req.body;

    const newReferral = new FHReferral({
      issueType,
      csiId,
      fhIssueId,
      fileLink,
      status,
      notes,
      createdBy: req.user.userId,
    });

    await newReferral.save();
    res.status(201).json({ message: 'Referral submitted', referral: newReferral });
  } catch (err) {
    console.error('Error creating referral:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all referrals (admin-only view for now)
router.get('/', verifyToken('admin'), async (req, res) => {
  try {
    const referrals = await FHReferral.find().populate('createdBy', 'firstName lastName email');
    res.status(200).json(referrals);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update a referral
router.put('/:id', verifyToken('admin'), async (req, res) => {
  try {
    const updatedReferral = await FHReferral.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedReferral) return res.status(404).json({ error: 'Referral not found' });

    res.status(200).json({ message: 'Referral updated', referral: updatedReferral });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete a referral
router.delete('/:id', verifyToken('admin'), async (req, res) => {
  try {
    await FHReferral.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Referral deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get referrals that haven't been updated in the last 10 days
router.get('/due-today', verifyToken('admin'), async (req, res) => {
  try {
    const tenDaysAgo = moment().subtract(10, 'days').toDate();
    const dueReferrals = await FHReferral.find({
      status: 'In progress',
      updatedAt: { $lte: tenDaysAgo },
    }).populate('createdBy', 'firstName lastName email');

    res.status(200).json(dueReferrals);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Send due-today referrals via email
router.post('/email-due', verifyToken('admin'), async (req, res) => {
  try {
    const tenDaysAgo = moment().subtract(10, 'days').toDate();
    const dueReferrals = await FHReferral.find({
      status: 'In progress',
      updatedAt: { $lte: tenDaysAgo },
    }).populate('createdBy', 'firstName lastName email');

    // Build HTML table
    const rows = dueReferrals.map(ref => `
      <tr>
        <td>${ref.issueType}</td>
        <td>${ref.csiId}</td>
        <td>${ref.fhIssueId}</td>
        <td><a href="${ref.fileLink}">Link</a></td>
        <td>${ref.status}</td>
        <td>${ref.notes}</td>
        <td>${ref.createdBy.firstName} ${ref.createdBy.lastName}</td>
        <td>${moment(ref.createdAt).format('YYYY-MM-DD')}</td>
        <td>${moment(ref.updatedAt).format('YYYY-MM-DD')}</td>
      </tr>`).join('');

    const htmlContent = `
      <h3>FH Issue Referrals Due for Update (as of ${moment().format('YYYY-MM-DD')})</h3>
      <table border="1" cellpadding="5">
        <thead>
          <tr><th>Type</th><th>CSI ID</th><th>FH ID</th><th>File</th><th>Status</th><th>Notes</th><th>Created By</th><th>Created</th><th>Updated</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    // Email via Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'yzhang@tccm.org',
      subject: `Referrals Due for Update - ${moment().format('YYYY-MM-DD')}`,
      html: htmlContent,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error('Email send failed:', err);
    res.status(500).json({ error: 'Email send failed', details: err.message });
  }
});

module.exports = router;
