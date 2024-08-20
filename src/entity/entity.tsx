import { LinkProps } from "@tanstack/react-router";
import { Alert } from "antd";
import {
  OptionType,
  QuerySelect,
  QuerySelectProps,
} from "../data-entry/QuerySelect";
import { EntityListProps } from "../pages/EntityList";
import { EntityItem } from "../types/shared";
import { EntityCreatePage } from "./EntityCreatePage";
import { EntityListPage } from "./EntityListPage";
import { EntityUpdatePage } from "./EntityUpdatePage";
import { EntityField } from "./entity-fields";

type EntityListConfig<T extends EntityItem> = Omit<
  EntityListProps<T>,
  "query"
> & {
  query: Omit<EntityListProps<T>["query"], "queryKey">;
};

export type EntityConfig<T extends EntityItem, S extends OptionType> = {
  name: string;
  rootRoute: LinkProps;
  list: EntityListConfig<T>;
  select?: QuerySelectProps<S>;
  getQueryFn?: (id: string) => Promise<T | null>;
  createMutationFn?: (values: T) => Promise<T>;
  updateMutationFn?: (id: string, values: T) => Promise<T>;
  deleteMutationFn?: (item: T) => Promise<unknown>;
};

export class Entity<T extends EntityItem, S extends OptionType> {
  protected fields: EntityField<T>[] = [];

  constructor(private config: EntityConfig<T, S>) {}

  protected clone(): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clone = new (this.constructor as any)(this.config);
    clone.fields = [...this.fields];
    return clone;
  }

  public addField(field: EntityField<T>): this {
    const clone = this.clone();
    clone.fields.push(field);
    return clone;
  }

  public getListPage() {
    return <EntityListPage config={this.config} />;
  }

  public getCreatePage() {
    return <EntityCreatePage config={this.config} fields={this.fields} />;
  }

  public getUpdatePage(id: string) {
    return (
      <EntityUpdatePage id={id} config={this.config} fields={this.fields} />
    );
  }
  public getSelectComponent() {
    if (!this.config.select) {
      return (
        <Alert
          message={`Select is not configured for entity ${this.config.name}`}
          type="error"
        />
      );
    }
    return (
      <QuerySelect
        {...this.config.select}
        // query={{
        //   queryKey: [this.config.name, "select"],
        //   queryFn: async () => {
        //     const res = await this.config.table.queryFn({
        //       sorter: [],
        //       filters: {},
        //       pagination: { current: 0, pageSize: 100 },
        //     });
        //     return res.items.map((item) => ({
        //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //       value: (item as any).id,
        //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //       label: (item as any).name,
        //     }));
        //   },
        // }}
      />
    );
  }
}
