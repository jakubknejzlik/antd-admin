import { Outlet, useChildMatches } from "@tanstack/react-router";
import { Spin } from "antd";
import { PropsWithChildren, Suspense } from "react";

export const Page = ({ children }: PropsWithChildren) => {
  const child = useChildMatches();
  if (child.length > 0) {
    return <Outlet />;
  }
  return (
    <Suspense fallback={<Spin style={{ width: "100%" }} />}>
      {children}
    </Suspense>
  );
};
