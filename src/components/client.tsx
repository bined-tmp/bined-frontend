"use client";

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  HttpOptions,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";
import { ReactNode } from "react";
import { useSession } from "next-auth/react";

const makeClient = (token: string): ApolloClient<NormalizedCacheObject> => {
  const authHeader: HttpOptions["headers"] = {
    Authorization: `Bearer ${token}`,
  };

  const headers = token ? authHeader : { "X-Hasura-Role": "anonymous" };

  const httpLink = new HttpLink({
    // NOTE: for development
    // working: localhost
    // not working: graphql-engine
    uri: process.env.NEXT_PUBLIC_GQL_URL,
    headers,
  });

  return new ApolloClient({
    connectToDevTools: process.env.NODE_ENV === "development" ? true : false,
    link: httpLink,
    cache: new InMemoryCache({ resultCaching: false }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
      query: {
        fetchPolicy: "network-only",
      },
    },
  });
};

export function ClientProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const { data, status } = useSession();

  if (status === "loading") {
    return <>loading...</>;
  }

  const client = makeClient(data?.user.token as string);

  const component = <section>{children}</section>;
  return <ApolloProvider client={client}>{component}</ApolloProvider>;
}
