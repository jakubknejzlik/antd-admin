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
      style={{
        backgroundColor: colorBgContainer,
        width: "100%",
        padding: "0.5rem 1rem 0.5rem 1rem",
      }}
    />
  );
};
