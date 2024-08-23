import { QueryKey } from "@tanstack/react-query";
import { LinkProps } from "@tanstack/react-router";
import { Alert } from "antd";
import { QueryTableWithButtonsProps } from "../data-display/QueryTableWithButtons";
import {
  OptionType,
  QuerySelect,
  QuerySelectProps,
} from "../data-entry/QuerySelect";
import { EntityItem } from "../types/shared";
import { EntityCreatePage, EntityCreatePageProps } from "./EntityCreatePage";
import { EntityListPage, EntityListPageProps } from "./EntityListPage";
import { EntityUpdatePage, EntityUpdatePageProps } from "./EntityUpdatePage";
import { EntityField } from "./entity-fields";

type EntityListConfig<T extends EntityItem> = Omit<
  QueryTableWithButtonsProps<T>,
  "query"
> & {
  query: Omit<QueryTableWithButtonsProps<T>["query"], "queryKey">;
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
  public fields: EntityField<T>[] = [];

  constructor(public config: EntityConfig<T, S>) {}

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

  public getListPage(props?: Omit<EntityListPageProps<T, S>, "entity">) {
    return <EntityListPage entity={this} {...props} />;
  }

  public getListPageQueryKey(): QueryKey {
    return [this.config.name, "list"];
  }

  public getCreatePage(props?: Omit<EntityCreatePageProps<T, S>, "entity">) {
    return <EntityCreatePage entity={this} {...props} />;
  }

  public getUpdatePage(
    id: string,
    props?: Omit<EntityUpdatePageProps<T, S>, "entity" | "id">
  ) {
    return <EntityUpdatePage id={id} entity={this} {...props} />;
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
