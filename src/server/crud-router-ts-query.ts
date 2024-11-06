import { z } from "zod";

import { Cond, ISerializable, Q, SelectQuery } from "@jakub.knejzlik/ts-query";

import { TRPCError } from "@trpc/server";
import { CreateCrudRouteOptions, createCrudRoutes } from "./crud-router";
import { RunQueriesHandler } from "./types";

type CreateTsQueryCrudRouteOptions<
  S extends z.AnyZodObject,
  T extends z.infer<S>,
> = {
  tableName: string;
  defaultSelect?: SelectQuery;
  runQueries: RunQueriesHandler;
} & CreateCrudRouteOptions<S, T>;

export const createTsQueryCrudRoutes = <
  S extends z.AnyZodObject,
  T extends z.infer<S>,
>({
  tableName,
  defaultSelect = Q.select().from(tableName),
  defaultValues,
  runQueries,
  ...rest
}: CreateTsQueryCrudRouteOptions<S, T>) => {
  const runQueryAll = async (query: ISerializable): Promise<Array<T>> => {
    const results = await runQueries([query]);
    return results[0]?.results as T[];
  };

  const runQueryFirst = async (query: ISerializable): Promise<T | null> => {
    const results = await runQueries([query]);
    return (results[0]?.results?.[0] ?? null) as T | null;
  };

  return createCrudRoutes({
    listHandlerFn: async () => {
      return runQueryAll(defaultSelect);
    },
    getHandlerFn: async ({ id }) => {
      return runQueryFirst(
        Q.select().from(defaultSelect, "t").where(Cond.equal("t.id", id))
      );
    },
    createHandlerFn: async ({ ...input }) => {
      const values = { ...(await defaultValues?.()), ...input };
      const result = await runQueryFirst(Q.insert(tableName).values([values]));

      if (!result) {
        throw new Error("Failed to create record");
      }

      // TODO handle returning new item
      const res = await runQueryFirst(
        Q.select()
          .from(defaultSelect, "t")
          .where(Cond.equal("t.id", (result as any)["id"]))
      );
      if (!res) {
        throw new Error("Failed to find created record");
      }
      return res;
    },
    updateHandlerFn: async ({ id, ...input }) => {
      const query = Q.update(tableName).set(input).where(Cond.equal("id", id));
      await runQueryFirst(query);
      // TODO handle returning updated item
      const result = await runQueryFirst(
        Q.select().from(tableName).where(Cond.equal("id", id))
      );
      return result as T | null;
    },
    deleteHandlerFn: async ({ id }) => {
      const result = await runQueryFirst(
        Q.select().from(defaultSelect).where(Cond.equal("id", id))
      );
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Record not found",
        });
      }
      await runQueryFirst(Q.delete(tableName).where(Cond.equal("id", id)));
      return result;
    },
    ...rest,
  });
};
