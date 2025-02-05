import { Cond, Fn, Q, SelectQuery } from "@jakub.knejzlik/ts-query";
import dayjs from "dayjs";
import {
  TableColumnStatsInput,
  TableQueryQueryState,
} from "../ui/data-display/QueryTable";

export const getSearchConditions = (columns: string[], search: string) => {
  const parts = search.split(" ");
  const and = [];
  for (const part of parts) {
    const or = [];
    for (const column of columns) {
      or.push(Cond.like(column, `${part}%`));
      or.push(Cond.like(column, `% ${part}%`));
      or.push(Cond.like(column, `%-${part}%`));
      or.push(Cond.like(column, `%_${part}%`));
    }
    and.push(Cond.or(or));
  }
  return Cond.and(and);
};

export const buildAntdTableQuery = (
  rootQuery: SelectQuery,
  input: TableQueryQueryState
): [SelectQuery, SelectQuery] => {
  const { pagination, sorter, filters, columns, search } = input;

  let sourceQuery = rootQuery;

  for (const [field, values] of Object.entries(filters)) {
    if (values === null || values.length === 0) {
      continue;
    }
    // TODO: handle range filters better than length === 2 with specific value types (eg. introduce >, <, >=, <= for filtering)
    if (
      values.length === 2 &&
      typeof values[0] === "number" &&
      typeof values[1] === "number"
    ) {
      sourceQuery = sourceQuery.where(
        Cond.between(field, values as [number, number])
      );
    } else if (
      values.length === 2 &&
      typeof values[0] === "string" &&
      dayjs(values[0]).isValid() &&
      typeof values[1] === "string" &&
      dayjs(values[1]).isValid()
    ) {
      sourceQuery = sourceQuery.where(
        Cond.between(field, values as [string, string])
      );
    } else {
      sourceQuery = sourceQuery.where(Cond.in(field, values));
    }
  }

  if (search && columns) {
    sourceQuery = sourceQuery.where(getSearchConditions(columns, search));
  }

  let query = sourceQuery
    .limit(pagination.pageSize)
    .offset((pagination.current - 1) * pagination.pageSize);

  if (columns) {
    query = query.addField("id");
    for (const column of columns) {
      query = query.addField(column, column);
    }
  }
  for (const { field, order } of sorter) {
    query = query.orderBy(field, order === "ascend" ? "ASC" : "DESC");
  }

  return [query, Q.select().from(sourceQuery).addField(Fn.count("*"), "total")];
};

export const buildAntdColumnStatsQuery = (
  selectQuery: SelectQuery,
  input: TableColumnStatsInput<any>
) => {
  const { column, pagination } = input;
  const _column = column.toString();
  let query = Q.select()
    .from(selectQuery)
    .addField(_column, "value")
    .groupBy(_column)
    .orderBy(_column);

  const queryWithoutPagination = query;
  if (pagination) {
    query = query
      .limit(pagination.pageSize)
      .offset((pagination.current - 1) * pagination.pageSize);
  } else {
    query = query.limit(100);
  }

  return [
    query,
    Q.select().from(queryWithoutPagination).addField(Fn.count("*"), "total"),
    Q.select()
      .from(queryWithoutPagination)
      .addField(Fn.min("value"), "min")
      .addField(Fn.max("value"), "max"),
  ];
};
