// import { useAuthenticator } from "@aws-amplify/ui-react";
import { Flex, Layout, Menu, theme } from "antd";

import { Outlet, useRouterState } from "@tanstack/react-router";

import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { PropsWithChildren } from "react";

const { Header, Content, Sider } = Layout;

interface LayoutProps {
  menuItems?: ItemType<MenuItemType>[];
  user?: { username: string };
  signOut?: () => void;
}

export const AdminLayout = ({
  children,
  menuItems,
  user,
  signOut,
}: PropsWithChildren<LayoutProps>) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // const { user, signOut } = useAuthenticator();
  // const matches = useMatches();
  // const matchRoute = useMatchRoute();

  const { matches } = useRouterState();
  // const pathNames = matches.map((match) => match.routeId);
  // const breadcrumbs: string[] = condensePathNames(pathNames);

  const lastMatch = matches[matches.length - 1];
  const openKeys = (lastMatch ? [lastMatch] : []).map(
    (m) => "/" + m.pathname.split("/")[1]
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ padding: 0 }}>
        <Flex
          justify="space-between"
          align="center"
          style={{
            height: 64,
          }}
        >
          <div className="text-md text-white p-10 w-52">
            <img src="/logo-white.png" alt="logo" />
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            items={[
              {
                key: "account",
                label: user?.username,
                children: [
                  {
                    key: "logout",
                    label: "Logout",
                    danger: true,
                    onClick: signOut,
                  },
                ],
              },
            ]}
            style={{ width: 300 }}
          />
        </Flex>
      </Header>
      <Layout>
        <Sider
          collapsible
          width={"13rem"}
          style={{ background: colorBgContainer }}
          className="w-52"
        >
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={openKeys}
            openKeys={openKeys}
            items={menuItems}
          />
        </Sider>
        <Content
          style={{
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
