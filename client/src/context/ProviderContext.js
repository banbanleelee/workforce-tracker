import React, { createContext, useState, useContext } from 'react';

// Create Context
const ProviderContext = createContext();

// Custom Hook for easier consumption
export const useProviderContext = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProviderContext must be used within a ProviderContextProvider');
  }
  return context;
};

// Context Provider Component
const ProviderContextProvider = ({ children }) => {
  // Static TINs and NPIs arrays
  const staticTINs = ['134246188', '200073131', '200073189', '263328413'];
  // const staticNPIs = [];
  const staticNPIs = [
'1437114113', '1538253190', '1730406901', '1669558573', '1790799864', '1962745752', '1629380308', '1205924800', '1750395828', '1053334748', '1538371901', '1831173293', '1205058856', '1245632033', '1346297330'
  ]; 

  // State for TIN queries
  const [tinQueries, setTinQueries] = useState(staticTINs);

  return (
    <ProviderContext.Provider value={{ tinQueries, setTinQueries, staticNPIs }}>
      {children}
    </ProviderContext.Provider>
  );
};

export { ProviderContextProvider };
