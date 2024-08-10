import { ISerializable } from "@jakub.knejzlik/ts-query";
import React, { ReactNode, createContext, useContext } from "react";

export interface QueryClientResponse {
  results?: Record<string, unknown>[][];
  metadata?: Record<string, unknown>;
}

export interface AntdAdminQueryClient {
  runQueries(queries: ISerializable[]): Promise<QueryClientResponse>;
}

interface AntdAdminQueryClientContextType {
  client?: AntdAdminQueryClient;
}

const AntdAdminQueryClientContext =
  createContext<AntdAdminQueryClientContextType>({});

export const AntdAdminQueryClientProvider: React.FC<{
  children: ReactNode;
  client: AntdAdminQueryClient;
}> = ({ children, client }) => {
  return (
    <AntdAdminQueryClientContext.Provider
      value={{
        client,
      }}
    >
      {children}
    </AntdAdminQueryClientContext.Provider>
  );
};

export const useQueryClientContext = (): AntdAdminQueryClientContextType => {
  const context = useContext(AntdAdminQueryClientContext);
  return context;
};
