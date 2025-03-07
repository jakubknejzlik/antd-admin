import { QueryKey } from "@tanstack/react-query";
import { Alert } from "antd";
import { TableColumnStatsQuery } from "../data-display/QueryTable";
import { QueryTableWithButtonsProps } from "../data-display/QueryTableWithButtons";
import {
  OptionType,
  QuerySelect,
  QuerySelectProps,
} from "../data-entry/QuerySelect";
import { EntityItem } from "../types/shared";
import { EntityDataSource } from "./entity-datasource";
import { EntityField } from "./entity-fields";
import { EntityCreatePage, EntityCreatePageProps } from "./EntityCreatePage";
import { EntityList } from "./EntityList";
import { EntityListPage, EntityListPageProps } from "./EntityListPage";
import { EntityUpdatePage, EntityUpdatePageProps } from "./EntityUpdatePage";

type EntityListConfig<T extends EntityItem> = Omit<
  QueryTableWithButtonsProps<T>,
  "query" | "columnStatsQuery"
> & {
  query?: Omit<QueryTableWithButtonsProps<T>["query"], "queryKey" | "queryFn">;
  columnStatsQuery?: Omit<TableColumnStatsQuery<T>, "queryKey" | "queryFn">;
};

export type EntityConfig<T extends EntityItem, S extends OptionType> = {
  name: string;
  dataSource: EntityDataSource<T>;
  select?: QuerySelectProps<S>;
  list?: EntityListConfig<T>;
};

export class Entity<T extends EntityItem, S extends OptionType = any> {
  public fields: EntityField<T>[] = [];

  constructor(public config: EntityConfig<T, S>) {}

  protected clone(): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clone = new (this.constructor as any)(this.config);
    clone.fields = [...this.fields];
    return clone;
  }

  public canCreate(): boolean {
    return !!this.config.dataSource.crud?.createMutationFn;
  }
  public canUpdate(): boolean {
    return !!this.config.dataSource.crud?.updateMutationFn;
  }
  public canDelete(): boolean {
    return !!this.config.dataSource.crud?.deleteMutationFn;
  }

  public addField(field: EntityField<T>): this {
    return this.addFields([field]);
  }

  public updateField(name: string, field: Partial<EntityField<T>>): this {
    const clone = this.clone();
    const index = clone.fields.findIndex((f) => f.name === name);
    if (index === -1) {
      throw new Error(`Field ${name} not found`);
    }
    clone.fields[index] = {
      ...clone.fields[index],
      ...field,
    } as EntityField<T>;
    return clone;
  }

  public addFields(fields: EntityField<T>[]): this {
    const clone = this.clone();
    for (const field of fields) {
      clone.fields.push(field);
    }
    return clone;
  }

  public getList(props?: Omit<EntityListPageProps<T, S>, "entity">) {
    return <EntityList entity={this} {...props} />;
  }

  public getListPage(props?: Omit<EntityListPageProps<T, S>, "entity">) {
    return <EntityListPage entity={this} {...props} />;
  }

  public getListPageQueryKey(): QueryKey {
    return [this.config.name, "list"];
  }

  public getCreatePage(props: Omit<EntityCreatePageProps<T, S>, "entity">) {
    return <EntityCreatePage entity={this} {...props} />;
  }

  public getUpdatePage(
    id: string,
    props: Omit<EntityUpdatePageProps<T, S>, "entity" | "id">
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
    return <QuerySelect {...this.config.select} />;
  }
}
