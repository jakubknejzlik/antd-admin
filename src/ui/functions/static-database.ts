import initSqlJs, { Database, QueryExecResult } from "sql.js";
import { ISequelizable, MySQLFlavor } from "@jakub.knejzlik/ts-query";
import dayjs from "dayjs";
import {
  ExpressionBase,
  FunctionExpression,
} from "@jakub.knejzlik/ts-query/dist/Expression";

export type DatabasePromise = Promise<StaticDatabase> | StaticDatabase;

export type StaticDataType =
  | "TEXT"
  | "REAL"
  | "INTEGER PRIMARY KEY AUTOINCREMENT"
  | "INTEGER"
  | "BLOB"
  | "DATETIME";

export type StaticDataTable = Record<string, any>[];
export type StaticDataTables = { [key: string]: StaticDataTable };

type StaticDatabaseMetadataTableColumn = {
  name: string;
  label: string;
  type: StaticDataType;
};
type StaticDatabaseMetadataTable = {
  columns: StaticDatabaseMetadataTableColumn[];
};
type StaticDatabaseMetadata = {
  tables: Record<string, StaticDatabaseMetadataTable>;
};

export type StaticDatabase = {
  tables: StaticDataTables;
  database: Database;
  metadata: StaticDatabaseMetadata;
};

class SQLiteFlavor extends MySQLFlavor {
  escapeFunction(fn: FunctionExpression): string {
    const args = fn.value
      .map((arg) => ExpressionBase.deserialize(arg).toSQL(this))
      .join(", ");
    if (fn.name === "MONTH") {
      return `strftime('%m', ${args}, 'localtime')`;
    }
    if (fn.name === "YEAR") {
      return `strftime('%Y', ${args}, 'localtime')`;
    }
    return super.escapeFunction(fn);
  }
}
const sqlite = new SQLiteFlavor();

const mapData = (data: QueryExecResult[]): Record<string, any>[] => {
  const values = data[0]?.values;
  if (!values || values.length === 0) {
    return [];
  }
  const columns = data[0]?.columns!;
  return values.map((row) =>
    row.reduce(
      (result, value, i) => ({
        ...result,
        [columns[i]!]: value,
      }),
      {}
    )
  );
};

export const createStaticDatabase = async (
  tables: StaticDataTables,
  { enforcePrimaryID }: { enforcePrimaryID: boolean } = {
    enforcePrimaryID: false,
  }
): Promise<StaticDatabase> => {
  const metadata: StaticDatabaseMetadata = {
    tables: Object.keys(tables).reduce(
      (result, tableName) => {
        result[tableName] = {
          columns: Object.keys(tables[tableName]?.[0] ?? {}).map((col) => {
            return {
              name: col
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/\s|[^\w]/g, "_"),
              label: col,
              type: dataTypeForColumn(
                col,
                tables[tableName]!,
                enforcePrimaryID
              ),
            };
          }),
        };
        return result;
      },
      {} as Record<string, StaticDatabaseMetadataTable>
    ),
  };
  const sqlJs = await initSqlJs({
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`,
  });
  const db = new sqlJs.Database();

  for (const tableName of Object.keys(tables)) {
    if (tables[tableName]!.length === 0) continue;
    await createDatabaseTable(
      db,
      tableName,
      tables[tableName]!,
      metadata.tables[tableName]!
    );
  }
  return {
    database: db,
    tables,
    metadata,
  };
};

const createDatabaseTable = async (
  db: Database,
  table: string,
  tableData: StaticDataTable,
  tableMetadata: StaticDatabaseMetadataTable
) => {
  const columns = tableMetadata.columns.map((c) => `\`${c.name}\` ${c.type}`);

  await db.run(`CREATE TABLE \`${table}\` (${columns.join(", ")})`);

  const CHUNK_SIZE = 300;
  const columnSize = tableData[0] ? Object.keys(tableData[0]).length : 0;
  for (let i = 0; i < tableData.length; i += CHUNK_SIZE) {
    const rows = tableData.slice(i, i + CHUNK_SIZE);
    const values: any[] = [];
    for (const row of rows) {
      values.push(...Object.values(row));
    }
    try {
      const vals = values.map((value, index) => {
        if (value === null) return null;
        if (tableMetadata.columns[index % columnSize]?.type === "DATETIME") {
          let val = dayjs(value);
          if (!val.isValid()) {
            val = dayjs(value, "M/D/YY");
            if (!val.isValid()) {
              throw new Error(`Invalid date ${value}`);
            }
          }
          return val.toISOString();
        }
        return value;
      });
      db.run(
        `INSERT INTO \`${table}\` VALUES ${rows
          .map((row) => `(${Object.values(row).map(() => "?")})`)
          .join(",")}`,
        vals
      );
    } catch (err) {
      throw new Error(
        `Error inserting row ${JSON.stringify(
          rows
        )}\n into table with columns [${columns.join(",")}], error: ${
          (err as Error).message
        }`
      );
    }
  }
};

const dataTypeForColumn = (
  columnName: string,
  tableData: StaticDataTable,
  enforcePrimaryID: boolean
): StaticDataType => {
  if (columnName === "id" && enforcePrimaryID)
    return "INTEGER PRIMARY KEY AUTOINCREMENT";
  const firstNCount = 500;
  const values = tableData
    .slice(0, firstNCount)
    .map((item) => item[columnName]);
  const types = new Set<StaticDataType>();
  for (const value of values) {
    const type = dataTypeForColumnForValue(value);
    types.add(type);
  }
  return types.has("DATETIME")
    ? "DATETIME"
    : (types.values().next().value ?? "TEXT");
};

const dateRegex =
  /(\d{4}-[01]\d-[0-3]\d\s[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\d\s[0-2]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\d\s[0-2]\d)/;
const isoDateRegex =
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;
const shortDateRegex = /^\d{1,2}\/\d{1,2}\/\d{1,2}$/;

const dataTypeForColumnForValue = (value: any): StaticDataType => {
  if (value === null) return "TEXT";
  if (typeof value === "boolean") return "INTEGER";
  if (
    value instanceof Date ||
    (typeof value === "string" &&
      (value.match(shortDateRegex) ||
        value.match(dateRegex) ||
        value.match(isoDateRegex)))
  )
    return "DATETIME";
  if (!isNaN(parseFloat(value))) {
    return "REAL";
  }
  return "TEXT";
};

export const executeQueries = (db: Database, queries: ISequelizable[]) => {
  const sqls = queries.map((q) => q.toSQL(sqlite));
  const results = sqls.map((sql) => {
    const rows = db!.exec(sql);
    return rows.length ? mapData(rows) : [];
  });

  return {
    data: {
      results,
    },
    error: undefined,
  };
};
