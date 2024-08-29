import { z } from "zod";

import { Cond, ISerializable, Q, SelectQuery } from "@jakub.knejzlik/ts-query";

import { initTRPC, TRPCError } from "@trpc/server";
import { RunQueriesHandler } from "./types";

const t = initTRPC.create();
const publicProcedure = t.procedure;

type CreateCrudRouteOptions<S extends z.AnyZodObject, T = z.infer<S>> = {
  tableName: string;
  defaultSelect?: SelectQuery;
  defaultValues?: () => Partial<T>;
  onCreate?: (value: Partial<T>) => Promise<void>;
  schema: S;
  runQueries: RunQueriesHandler;
};
export const createCrudRoutes = <S extends z.AnyZodObject, T = z.infer<S>>({
  tableName,
  defaultSelect = Q.select().from(tableName),
  defaultValues,
  onCreate,
  schema,
  runQueries,
}: CreateCrudRouteOptions<S>) => {
  const runQueryAll = async <T>(query: ISerializable): Promise<Array<T>> => {
    const results = await runQueries([query]);
    return results[0]?.results as T[];
  };

  const runQueryFirst = async <T>(query: ISerializable): Promise<T | null> => {
    const results = await runQueries([query]);
    return (results[0]?.results?.[0] ?? null) as T | null;
  };

  return {
    list: publicProcedure.query(async () => {
      const results = await runQueryAll<T>(defaultSelect);
      return results;
    }),
    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return runQueryFirst<T>(
          Q.select()
            .from(defaultSelect, "t")
            .where(Cond.equal("t.id", input.id))
        );
      }),
    create: publicProcedure
      .input(schema.omit({ id: true }))
      .mutation(async ({ input }) => {
        const values = { ...defaultValues?.(), ...input };
        await runQueryFirst<T>(Q.insert(tableName).values([values]));
        // TODO handle returning new item
        const res = await runQueryFirst<T>(
          Q.select().from(tableName).where(Cond.equal("id", values["id"]))
        );
        if (onCreate) {
          await onCreate(values as S);
        }
        return res as T;
      }),
    update: publicProcedure
      .input(z.object({ id: z.string() }).merge(schema.partial()))
      .mutation(async ({ input: { id, ...input } }) => {
        if (Object.keys(input).length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No fields to update",
          });
        }
        const query = Q.update(tableName)
          .set(input)
          .where(Cond.equal("id", id));
        console.log("?", query.toSQL());
        await runQueryFirst<T>(query);
        // TODO handle returning updated item
        const result = await runQueryFirst<T>(
          Q.select().from(tableName).where(Cond.equal("id", id))
        );
        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Record not found",
          });
        }
        return result as T;
      }),
    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input: { id } }) => {
        const result = await runQueryFirst<T>(
          Q.select().from(defaultSelect).where(Cond.equal("id", id))
        );
        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Record not found",
          });
        }
        await runQueryFirst<T>(Q.delete(tableName).where(Cond.equal("id", id)));
        return result;
      }),
  };
};
