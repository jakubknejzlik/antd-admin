import { PlusOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Button, Card, CardProps, Space } from "antd";
import { useState } from "react";
import { OptionType } from "../data-entry/QuerySelect";
import { SearchInput } from "../data-entry/SearchInput";
import { Page } from "../layout";
import { EntityItem } from "../types/shared";
import { Entity } from "./entity";
import { EntityList, EntityListProps } from "./EntityList";

export type EntityListPageProps<
  T extends EntityItem,
  S extends OptionType,
> = EntityListProps<T, S> & {
  entity: Entity<T, S>;
  card?: Partial<CardProps>;
};

type EntityListPageState = { search?: string };

export const EntityListPage = <T extends EntityItem, S extends OptionType>({
  entity,
  card,
  ...props
}: EntityListPageProps<T, S>) => {
  const [state, setState] = useState<EntityListPageState>({});
  const { name, rootRoute } = entity.config;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootPath = rootRoute.to as any;
  const { extra, ...cardProps } = card ?? {};
  return (
    <Page>
      <Card
        title={name}
        extra={
          <Space>
            {extra}
            <SearchInput
              value={state.search}
              onChange={(search) => setState((state) => ({ ...state, search }))}
            />
            <Link from={rootPath} to={"./new" as string}>
              <Button icon={<PlusOutlined />} />
            </Link>
          </Space>
        }
        styles={{ body: { padding: 0 } }}
        {...cardProps}
      >
        <EntityList entity={entity} search={state.search} {...props} />
      </Card>
    </Page>
  );
};
