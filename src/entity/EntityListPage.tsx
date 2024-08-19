import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Button, Card } from "antd";
import { AnyObject } from "antd/es/_util/type";
import { Page } from "../layout";
import { EntityList, EntityListItem } from "../pages/EntityList";
import { EntityConfig } from "./entity";

type EntityListPageProps<
  T extends AnyObject = AnyObject,
  L extends EntityListItem = EntityListItem,
> = {
  config: EntityConfig<T, L>;
};

export const EntityListPage = ({ config }: EntityListPageProps) => {
  const { name, rootRoute, table, deleteMutationFn, updateMutationFn } = config;
  return (
    <Page>
      <Card
        title={name}
        extra={
          <Link from={rootRoute.to} to={"./new" as string}>
            <Button icon={<PlusOutlined />} />
          </Link>
        }
        styles={{ body: { padding: 0 } }}
      >
        <EntityList
          query={{
            queryKey: [rootRoute.to, "list"],
            queryFn: table.queryFn,
          }}
          columns={table.columns}
          buttons={
            updateMutationFn
              ? ({ id }) => (
                  <Link
                    from={rootRoute.to}
                    to={"./$id" as string}
                    params={{ id }}
                  >
                    <Button icon={<EditOutlined />} />
                  </Link>
                )
              : undefined
          }
          deleteMutationFn={deleteMutationFn}
        />
      </Card>
    </Page>
  );
};
