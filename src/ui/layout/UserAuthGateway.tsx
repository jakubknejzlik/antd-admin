// import { useAuthenticator } from "@aws-amplify/ui-react";
import { Button, Result, Spin } from "antd";

import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

type User = {
  username: string;
};
type UserValue = User | null;

export interface UserAuthGatewayProps {
  user?: (() => Promise<UserValue>) | Promise<UserValue> | UserValue;
  signOut?: () => void;
  render: (props: { user: User }) => React.ReactNode;
}

export const UserAuthGateway = ({
  render,
  user,
  signOut,
}: PropsWithChildren<UserAuthGatewayProps>) => {
  const userData = useQuery({
    queryKey: ["user-auth-gateway", "user"],
    queryFn: () => {
      if (typeof user === "function") {
        return user();
      }
      return user ?? null;
    },
  });

  if (userData.isLoading) {
    return <Spin style={{ width: "100%", height: "100%" }} />;
  }

  if (userData.error) {
    return (
      <Result
        status="403"
        title="Unauthorized"
        subTitle={userData.error.message}
        extra={
          <Button type="primary" onClick={signOut}>
            Logout
          </Button>
        }
      />
    );
  }

  if (!userData.data) {
    return (
      <Result
        status="403"
        title="Unauthorized"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={signOut}>
            Logout
          </Button>
        }
      />
    );
  }

  return render({ user: userData.data });
};
