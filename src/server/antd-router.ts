import { z } from "zod";

import { initTRPC } from "@trpc/server";
import { AnyMiddlewareBuilder } from "@trpc/server/unstable-core-do-not-import";

export type TableResult<T> = { items: T[]; total: number };
type SelectResult = { items: any[]; total: number };
type ColumnStatsResult = {
  values: any[];
  valuesTotal: number;
  min: any;
  max: any;
};

const PaginationSchema = z.object({
  current: z.number(),
  pageSize: z.number(),
});

const TableInputSchema = z.object({
  pagination: PaginationSchema,
  sorter: z.array(
    z.object({
      field: z.union([z.string(), z.number()]),
      order: z.enum(["ascend", "descend"]),
    })
  ),
  filters: z.record(
    z
      .array(z.union([z.string(), z.boolean(), z.number(), z.bigint()]))
      .nullable()
  ),
  columns: z.array(z.string()).optional(),
  search: z.string().optional(),
  groupBy: z.array(z.string()).optional(),
});

const SelectInputSchema = z.object({
  search: z.string().optional(),
  pagination: PaginationSchema.optional(),
});
const ColumnStatsInputSchema = z.object({
  column: z.string(),
  pagination: PaginationSchema.optional(),
});

type CreateAntdRouteOptions<T> = {
  middleware?: AnyMiddlewareBuilder;
  tableHandlerFn?: (
    query: z.infer<typeof TableInputSchema>
  ) => Promise<TableResult<T>>;
  selectHandlerFn?: (
    query: z.infer<typeof SelectInputSchema>
  ) => Promise<SelectResult>;
  columnStatsHandlerFn?: (
    query: z.infer<typeof ColumnStatsInputSchema>
  ) => Promise<ColumnStatsResult>;
};

const t = initTRPC.create();

export const createAntdRoutes = <T>({
  middleware,
  tableHandlerFn,
  selectHandlerFn,
  columnStatsHandlerFn,
}: CreateAntdRouteOptions<T>) => {
  const procedure = middleware ? t.procedure.use(middleware) : t.procedure;
  return {
    table: procedure
      .input(TableInputSchema)
      .query(async ({ input }): Promise<TableResult<T>> => {
        return (await tableHandlerFn?.(input)) ?? { items: [], total: 0 };
      }),
    select: procedure
      .input(SelectInputSchema)
      .query(async ({ input }): Promise<SelectResult> => {
        return (await selectHandlerFn?.(input)) ?? { items: [], total: 0 };
      }),
    columnStats: procedure
      .input(ColumnStatsInputSchema)
      .query(async ({ input }): Promise<ColumnStatsResult> => {
        return (
          (await columnStatsHandlerFn?.(input)) ?? {
            values: [],
            valuesTotal: 0,
            min: null,
            max: null,
          }
        );
      }),
  };
};
