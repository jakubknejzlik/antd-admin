import { Outlet, useChildMatches } from "@tanstack/react-router";
import { PropsWithChildren } from "react";

export const Page = ({ children }: PropsWithChildren) => {
  const child = useChildMatches();
  if (child.length > 0) {
    return <Outlet />;
  }
  return children;
};
