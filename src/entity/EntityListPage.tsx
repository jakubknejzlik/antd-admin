import { PlusOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Button, Card } from "antd";
import { OptionType } from "../data-entry/QuerySelect";
import { Page } from "../layout";
import { EntityItem } from "../types/shared";
import { Entity } from "./entity";
import { EntityList, EntityListProps } from "./EntityList";

export type EntityListPageProps<
  T extends EntityItem,
  S extends OptionType,
> = EntityListProps<T, S> & {
  entity: Entity<T, S>;
};

export const EntityListPage = <T extends EntityItem, S extends OptionType>({
  entity,
  ...props
}: EntityListPageProps<T, S>) => {
  const { name, rootRoute } = entity.config;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootPath = rootRoute.to as any;
  return (
    <Page>
      <Card
        title={name}
        extra={
          <Link from={rootPath} to={"./new" as string}>
            <Button icon={<PlusOutlined />} />
          </Link>
        }
        styles={{ body: { padding: 0 } }}
      >
        <EntityList entity={entity} {...props} />
      </Card>
    </Page>
  );
};
