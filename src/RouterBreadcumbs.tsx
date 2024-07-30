import { HomeOutlined } from "@ant-design/icons";
import { Link, useRouterState } from "@tanstack/react-router";
import { Breadcrumb, theme } from "antd";

export const RouterBreadcumbs = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const breadcrumbs = useRouterState({
    select: (state) => {
      return state.matches
        .map((match) => ({
          title: match.meta?.find((tag) => tag.title)?.title as
            | string
            | undefined,
          path: match.pathname,
        }))
        .filter((crumb) => Boolean(crumb.title))
        .map((p) => ({
          title: <Link to={p.path}>{p.title}</Link>,
        }));
    },
  });
  return (
    <Breadcrumb
      items={[
        {
          title: (
            <Link to="/">
              <HomeOutlined />
            </Link>
          ),
        },
        ...breadcrumbs,
      ]}
      className="px-4 py-2 w-full"
      style={{ backgroundColor: colorBgContainer }}
    />
  );
};
