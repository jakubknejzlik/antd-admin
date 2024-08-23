import { PlusOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Button, Card, CardProps, Input, Space } from "antd";
import { OptionType } from "../data-entry/QuerySelect";
import { Page } from "../layout";
import { EntityItem } from "../types/shared";
import { Entity } from "./entity";
import { EntityList, EntityListProps } from "./EntityList";
import { useState } from "react";

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
            <Input
              value={state.search}
              onChange={(e) =>
                setState((state) => ({ ...state, search: e.target.value }))
              }
              allowClear
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
