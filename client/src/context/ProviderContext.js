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
  const staticNPIs = ['1003058454', '1346530904', '1124092945', '1891754271'];

  // State for TIN queries
  const [tinQueries, setTinQueries] = useState(staticTINs);

  return (
    <ProviderContext.Provider value={{ tinQueries, setTinQueries, staticNPIs }}>
      {children}
    </ProviderContext.Provider>
  );
};

export { ProviderContextProvider };
