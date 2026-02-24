'use client';

import React, { useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '@/types/user';
import { useClerk, useOrganization } from '@clerk/nextjs';
// import { ClientService } from "@/services/clients.service"; // replaced with encrypted API call
import { encryptedApiCall } from '@/lib/encrypted-api';

interface ClientContextProps {
  client?: User;
}

export const ClientContext = React.createContext<ClientContextProps>({
  client: undefined,
});

interface ClientProviderProps {
  children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [client, setClient] = useState<User>();
  const { user } = useClerk();
  const { organization } = useOrganization();

  const [clientLoading, setClientLoading] = useState(true);

  const fetchClient = async () => {
    try {
      setClientLoading(true);
      const response = await encryptedApiCall('/api/sync-user', {
        id: user?.id,
        email: user?.emailAddresses[0]?.emailAddress,
        organization_id: organization?.id,
      });
      setClient(response);
    } catch (error) {
      console.error(error);
    }
    setClientLoading(false);
  };

  const fetchOrganization = async () => {
    try {
      setClientLoading(true);
      await encryptedApiCall('/api/sync-organization', {
        id: organization?.id,
        name: organization?.name,
        image_url: organization?.imageUrl,
      });
    } catch (error) {
      console.error(error);
    }
    setClientLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      fetchClient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (organization?.id) {
      fetchOrganization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  return (
    <ClientContext.Provider
      value={{
        client,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export const useClient = () => {
  const value = useContext(ClientContext);

  return value;
};
