const mongoose = require('mongoose');

const fhIssueReferralSchema = new mongoose.Schema({
  issueType: {
    type: String,
    enum: ['Provider Directory', 'Balance Billed Discount Amount'],
    required: false,
  },
  csiId: {
    type: String,
    match: /^\d{7}$/,
    required: true,
  },
  fhIssueId: {
    type: String,
    match: /^\d{8}$/,
    required: false,
  },
  fileLink: {
    type: String,
    match: /^https?:\/\/.+/,
    required: false,
  },
  status: {
    type: String,
    enum: ['In progress', 'Resolved'],
    default: 'In progress',
    required: false,
  },
  notes: {
    type: String,
    default: '',
    required: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('FHReferral', fhIssueReferralSchema);
