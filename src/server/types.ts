import { ISerializable } from "@jakub.knejzlik/ts-query";

type QueryResult<T> = {
  results: T[];
  meta: Record<string, any>;
  error: string | null;
};
export type RunQueriesHandler = <T>(
  queries: ISerializable[]
) => Promise<Array<QueryResult<T>>>;
