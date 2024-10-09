// import { useAuthenticator } from "@aws-amplify/ui-react";
import { Menu } from "antd";

import { useRouterState } from "@tanstack/react-router";

import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { PropsWithChildren, useState } from "react";

export interface AdminLayoutMenuProps {
  items?: ItemType<MenuItemType>[];
}

export const AdminLayoutMenu = ({
  items: menuItems,
}: PropsWithChildren<AdminLayoutMenuProps>) => {
  const { matches } = useRouterState();
  const [openKeys, setOpenKeys] = useState<string[] | undefined>();

  const lastMatch = matches[matches.length - 1];

  const selectedKeys = lastMatch
    ? lastMatch.pathname === "/"
      ? ["/"]
      : lastMatch.pathname
          .split("/")
          .filter((x) => x)
          .reduce(
            (acc, val) => [...acc, [...acc, val].join("/")],
            [] as string[]
          )
          .map((p) => "/" + p)
    : [];

  return (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={selectedKeys}
      openKeys={openKeys ?? selectedKeys}
      onOpenChange={(keys) => {
        setOpenKeys(keys);
      }}
      items={menuItems}
    />
  );
};
