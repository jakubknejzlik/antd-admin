// import { useAuthenticator } from "@aws-amplify/ui-react";
import { Dropdown, Flex, Layout, Space, theme } from "antd";

import { DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { PropsWithChildren } from "react";
import { AdminLayoutMenu } from "./LayoutMenu";

const { Header, Content, Sider } = Layout;

export interface AdminLayoutProps {
  menuItems?: ItemType<MenuItemType>[];
  user?: { username: string };
  header?: React.ReactNode;
  signOut?: () => void;
  logo?: React.ReactNode;
}

export const AdminLayout = ({
  children,
  menuItems,
  user,
  header,
  signOut,
  logo,
}: PropsWithChildren<AdminLayoutProps>) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

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
          {logo || (
            <div style={{ width: "13rem", padding: "2.5rem", color: "white" }}>
              <img src="/logo.png" alt="logo" />
            </div>
          )}
          <Space>
            {header}
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
          </Space>
        </Flex>
      </Header>
      <Layout>
        <Sider
          collapsible
          width={"13rem"}
          style={{ background: colorBgContainer }}
          className="w-52"
        >
          <AdminLayoutMenu items={menuItems} />
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
