'use client';

import { ResponseService } from '@/services/responses.service';
import React, { useCallback, useContext, useMemo } from 'react';

interface Response {
  createResponse: (payload: any) => void;
  saveResponse: (payload: any, call_id: string) => void;
}

export const ResponseContext = React.createContext<Response>({
  createResponse: () => {},
  saveResponse: () => {},
});

interface ResponseProviderProps {
  children: React.ReactNode;
}

export function ResponseProvider({ children }: ResponseProviderProps) {
  const createResponse = useCallback(async (payload: any) => {
    const data = await ResponseService.createResponse({ ...payload });
    
return data;
  }, []);

  const saveResponse = useCallback(async (payload: any, call_id: string) => {
    await ResponseService.saveResponse({ ...payload }, call_id);
  }, []);

  const contextValue = useMemo(
    () => ({ createResponse, saveResponse }),
    [createResponse, saveResponse]
  );

  return (
    <ResponseContext.Provider value={contextValue}>
      {children}
    </ResponseContext.Provider>
  );
}

export const useResponses = () => {
  const value = useContext(ResponseContext);

  return value;
};
