import { z } from "zod";

import { initTRPC, TRPCError } from "@trpc/server";
import { AnyMiddlewareBuilder } from "@trpc/server/unstable-core-do-not-import";

const t = initTRPC.create();

const detailInputSchema = z.object({ id: z.string() });

export type CreateCrudRouteOptions<
  S extends z.AnyZodObject,
  T extends z.infer<S>,
> = {
  middleware?: AnyMiddlewareBuilder;
  schema: S;
  defaultValues?: () => Promise<Partial<T>>;
  transformValues?: (values: Partial<T>) => Promise<Partial<T>>;
  onCreate?: (value: T, ctx: any) => Promise<void>;
  onUpdate?: (value: T, prev?: T) => Promise<void>;
  onDelete?: (value: T) => Promise<void>;
};

type CreateCrudRouteHandlers<S extends z.AnyZodObject, T extends z.infer<S>> = {
  listHandlerFn?: () => Promise<T[]>;
  getHandlerFn?: (
    input: z.infer<typeof detailInputSchema>
  ) => Promise<T | null>;
  defaultValues?: () => Promise<Partial<T>>;
  createHandlerFn?: (input: Omit<T, "id">) => Promise<T>;
  updateHandlerFn?: (
    input: { id: string } & Partial<Omit<T, "id">>
  ) => Promise<T | null>;
  deleteHandlerFn?: (
    input: z.infer<typeof detailInputSchema>
  ) => Promise<T | null>;
};

export const createCrudRoutes = <
  S extends z.AnyZodObject,
  T extends z.infer<S>,
>({
  defaultValues,
  transformValues,
  listHandlerFn,
  getHandlerFn,
  createHandlerFn,
  updateHandlerFn,
  deleteHandlerFn,
  onCreate,
  onUpdate,
  onDelete,
  schema,
  middleware,
}: CreateCrudRouteOptions<S, T> & CreateCrudRouteHandlers<S, T>) => {
  const procedure = middleware ? t.procedure.use(middleware) : t.procedure;

  return {
    list: procedure.query(async () => {
      if (!listHandlerFn) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "handler not implemented",
        });
      }
      return listHandlerFn();
    }),
    get: procedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        if (!getHandlerFn) {
          throw new TRPCError({
            code: "NOT_IMPLEMENTED",
            message: "handler not implemented",
          });
        }
        const result = await getHandlerFn(input);
        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Record not found",
          });
        }
        return result;
      }),
    create: procedure
      .input(
        schema.omit({ id: true }).merge(z.object({ id: z.string().optional() }))
      )
      .mutation(async ({ input, ctx }) => {
        if (!createHandlerFn) {
          throw new TRPCError({
            code: "NOT_IMPLEMENTED",
            message: "handler not implemented",
          });
        }
        const values = { ...(await defaultValues?.()), ...input } as Partial<T>;
        const transformedValues = (await transformValues?.(values)) ?? values;
        const res = await createHandlerFn(transformedValues as Omit<T, "id">);
        if (onCreate) {
          await onCreate(res, ctx);
        }
        return res;
      }),
    update: procedure
      .input(schema.omit({ id: true }).partial().extend({ id: z.string() }))
      .mutation(async ({ input: { id, ...input } }) => {
        if (!updateHandlerFn) {
          throw new TRPCError({
            code: "NOT_IMPLEMENTED",
            message: "handler not implemented",
          });
        }
        if (Object.keys(input).length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No fields to update",
          });
        }

        const _id = id as string;
        const item = id && (await getHandlerFn?.({ id: _id }));
        const transformedValues =
          (await transformValues?.({
            id: _id,
            ...input,
          } as unknown as Partial<T>)) ?? input;

        const result = await updateHandlerFn({
          id: _id,
          ...transformedValues,
        } as {
          id: string;
        } & Partial<Omit<T, "id">>);
        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Record not found",
          });
        }
        if (onUpdate) {
          await onUpdate(result as T, item as T);
        }
        return result as T;
      }),
    createOrUpdate: procedure
      .input(schema.omit({ id: true }).partial().extend({ id: z.string() }))
      .mutation(async ({ input: { id, ...input }, ctx }) => {
        if (Object.keys(input).length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No fields to create or update",
          });
        }

        const _id = id as string;
        const item = id && (await getHandlerFn?.({ id: _id }));
        if (!item) {
          if (!createHandlerFn) {
            throw new TRPCError({
              code: "NOT_IMPLEMENTED",
              message: "create handler not implemented",
            });
          }
          const values = {
            ...(await defaultValues?.()),
            ...input,
          } as Partial<T>;
          const transformedValues = (await transformValues?.(values)) ?? values;
          const res = await createHandlerFn(transformedValues as Omit<T, "id">);
          if (onCreate) {
            await onCreate(res, ctx);
          }
          return res;
        } else {
          if (!updateHandlerFn) {
            throw new TRPCError({
              code: "NOT_IMPLEMENTED",
              message: "update handler not implemented",
            });
          }
          const transformedValues =
            (await transformValues?.({
              id: _id,
              ...input,
            } as unknown as Partial<T>)) ?? input;

          const result = await updateHandlerFn({
            id: _id,
            ...transformedValues,
          } as {
            id: string;
          } & Partial<Omit<T, "id">>);
          if (!result) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Record not found",
            });
          }
          if (onUpdate) {
            await onUpdate(result as T, item as T);
          }
          return result as T;
        }
      }),
    delete: procedure.input(detailInputSchema).mutation(async ({ input }) => {
      if (!deleteHandlerFn) {
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "handler not implemented",
        });
      }
      const result = await deleteHandlerFn(input);
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Record not found",
        });
      }
      if (onDelete) {
        await onDelete(result as T);
      }
      return result;
    }),
  };
};
