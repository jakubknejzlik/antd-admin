import { LinkProps } from "@tanstack/react-router";
import { AnyObject } from "antd/es/_util/type";
import { QueryTableProps, TableQueryQuery } from "../data-display/QueryTable";
import { QueryFormProps } from "../data-entry/QueryForm";
import { QuerySelect } from "../data-entry/QuerySelect";
import { EntityListItem } from "../pages/EntityList";
import { EntityCreatePage } from "./EntityCreatePage";
import { EntityListPage } from "./EntityListPage";
import { EntityUpdatePage } from "./EntityUpdatePage";
import { EntityField } from "./entity-fields";

type EntityTableConfig<L extends EntityListItem> = {
  queryFn: TableQueryQuery<L>["queryFn"];
  columns: QueryTableProps<L>["columns"];
};

export type EntityConfig<
  T extends AnyObject,
  L extends EntityListItem = EntityListItem,
> = {
  name: string;
  table: EntityTableConfig<L>;
  getQueryFn?: (id: string) => Promise<T | null>;
  createMutationFn?: QueryFormProps<T>["mutation"]["mutationFn"];
  updateMutationFn?: (id: string, values: T) => Promise<T>;
  deleteMutationFn?: (item: T) => Promise<unknown>;
  rootRoute: LinkProps;
};

export class Entity<T extends EntityListItem = EntityListItem> {
  protected fields: EntityField[] = [];

  constructor(private config: EntityConfig<T>) {}

  protected clone(): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clone = new (this.constructor as any)(this.config);
    clone.fields = [...this.fields];
    return clone;
  }

  public addField(field: EntityField): this {
    const clone = this.clone();
    clone.fields.push(field);
    return clone;
  }

  public getListPage() {
    return <EntityListPage config={this.config} />;
  }

  public getCreatePage() {
    console.log("???");
    return <EntityCreatePage config={this.config} fields={this.fields} />;
  }

  public getUpdatePage(id: string) {
    return (
      <EntityUpdatePage id={id} config={this.config} fields={this.fields} />
    );
  }
  public getSelectComponent() {
    return (
      <QuerySelect
        query={{
          queryKey: [this.config.name, "select"],
          queryFn: async () => {
            const res = await this.config.table.queryFn({
              sorter: [],
              filters: {},
              pagination: { current: 0, pageSize: 100 },
            });
            return res.items.map((item) => ({
              value: item.id,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label: (item as any).name,
            }));
          },
        }}
      />
    );
  }
}
