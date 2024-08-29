// import { useAuthenticator } from "@aws-amplify/ui-react";
import { Dropdown, Flex, Layout, Menu, Space, theme } from "antd";

import { useRouterState } from "@tanstack/react-router";

import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { PropsWithChildren } from "react";
import { DownOutlined, LogoutOutlined } from "@ant-design/icons";

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

  const { matches } = useRouterState();

  const lastMatch = matches[matches.length - 1];
  const openKeys = (lastMatch ? [lastMatch] : []).map(
    (m) => "/" + m.pathname.split("/")[1]
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ padding: 0, paddingRight: "1.5rem" }}>
        <Flex
          justify="space-between"
          align="center"
          style={{
            height: 64,
          }}
        >
          <div style={{ width: "13rem", padding: "2.5rem", color: "white" }}>
            <img src="/logo.png" alt="logo" />
          </div>
          <Dropdown
            menu={{
              items: [
                {
                  key: "logout",
                  label: "Logout",
                  icon: <LogoutOutlined />,
                  onClick: signOut,
                },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space style={{ color: "white" }}>
                {user?.username}
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
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
