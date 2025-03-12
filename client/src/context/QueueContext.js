import React, { createContext, useContext } from 'react';

const QueueContext = createContext([]);

export const QueueProvider = ({ children }) => {
  const queues = [
    'Personal Email',
    'SF Discount Dispute',
    'Alpha Split: Discount Dispute',
    'Alpha Split: Pre-service Dispute',
    'PCS: Data I Dispute',
    'PCS: Faircost Dispute',
    'PCS: Discount Dispute',
    'PCS: Pre-service Dispute',
    'PCS: FH Discount Dispute',
    'PCS: FH Pre-service Dispute',
    'PCS: MP Discount Dispute',
    'PCS: MP Pre-service Dispute',
    'HCBB Data Project',
    'Chapel',
    'Break',
    'Training',
    'Lunch',
    'IT Issue',
    'PCS Email Inbox',
    'LinkedIn Learning',
    'Meeting',
    'Aged Calls Cleaning',
    'Personal Queue',
    'Direct Contracts',
  ];

  return (
    <QueueContext.Provider value={queues}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueues = () => useContext(QueueContext);
