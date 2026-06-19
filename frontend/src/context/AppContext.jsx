import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentRepo, setCurrentRepo] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <AppContext.Provider
      value={{
        currentRepo,
        setCurrentRepo,
        analysisData,
        setAnalysisData,
        loading,
        setLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);