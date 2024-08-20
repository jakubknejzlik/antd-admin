import { useNavigate } from "@tanstack/react-router";
import { Card, Form } from "antd";
import { QueryForm } from "../data-entry/QueryForm";
import { Page } from "../layout";
import { EntityConfig } from "./entity";
import { EntityField, inputForField } from "./entity-fields";
import { EntityItem } from "../types/shared";
import { OptionType } from "../data-entry/QuerySelect";

type EntityCreatePageProps<T extends EntityItem, S extends OptionType> = {
  config: EntityConfig<T, S>;
  fields: EntityField<T>[];
};

export const EntityCreatePage = <T extends EntityItem, S extends OptionType>({
  config,
  fields,
}: EntityCreatePageProps<T, S>) => {
  const { name, rootRoute, createMutationFn } = config;
  const navigate = useNavigate();
  return (
    <Page>
      <Card title={`Create new ${name}`}>
        <QueryForm
          mutation={{
            mutationFn: createMutationFn,
            onSuccess: () => {
              navigate(rootRoute);
            },
          }}
        >
          {fields.map((field) => (
            <Form.Item label={field.label ?? field.name} name={field.name}>
              {inputForField(field)}
            </Form.Item>
          ))}
        </QueryForm>
      </Card>
    </Page>
  );
};
