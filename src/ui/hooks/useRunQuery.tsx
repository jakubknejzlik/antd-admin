import { ISerializable } from "@jakub.knejzlik/ts-query";
import { useQuery } from "@tanstack/react-query";
import { useQueryClientContext } from "../contexts/QueryClientContext";

interface UseRunQueryOpts {
  query: ISerializable;
}
export const useRunQuery = ({ query }: UseRunQueryOpts) => {
  const { data, ...rest } = useRunQueries({ queries: [query] });
  return { data: { results: data?.results?.[0] }, ...rest };
};

interface UseRunQueriesOpts {
  queries: ISerializable[];
}
export const useRunQueries = ({ queries }: UseRunQueriesOpts) => {
  const ctx = useQueryClientContext();
  return useQuery({
    queryKey: ["query", queries],
    queryFn: async () => {
      if (!ctx.client) {
        throw new Error("No query client provided");
      }
      return ctx.client.runQueries(queries);
    },
  });
};
