import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Button, Card } from "antd";
import { Page } from "../layout";
import { EntityList } from "../pages/EntityList";
import { EntityConfig } from "./entity";
import { EntityItem } from "../types/shared";
import { OptionType } from "../data-entry/QuerySelect";

type EntityListPageProps<T extends EntityItem, S extends OptionType> = {
  config: EntityConfig<T, S>;
};

export const EntityListPage = <T extends EntityItem, S extends OptionType>({
  config,
}: EntityListPageProps<T, S>) => {
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
              ? (item) => (
                  <Link
                    from={rootRoute.to}
                    to={"./$id" as string}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    params={{ id: (item as any).id }}
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
