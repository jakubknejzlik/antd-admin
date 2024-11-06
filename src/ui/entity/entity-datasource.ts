import { TableColumnStatsQuery } from "../data-display/QueryTable";
import { QueryTableWithButtonsProps } from "../data-display/QueryTableWithButtons";
import { EntityItem } from "../types/shared";

export interface EntityDataSource<T extends EntityItem> {
  listQueryFn?: QueryTableWithButtonsProps<T>["query"]["queryFn"];
  listColumnStatsQueryFn?: TableColumnStatsQuery<T>["queryFn"];
  crud?: {
    listQueryFn?: () => Promise<T[]>;
    getQueryFn?: (id: string) => Promise<T | null>;
    createMutationFn?: (values: T) => Promise<T>;
    updateMutationFn?: (id: string, values: T) => Promise<T>;
    deleteMutationFn?: (item: T) => Promise<unknown>;
  };
}
