import {
  from,
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";
import { onError } from "@apollo/client/link/error";
import fetch from "node-fetch";

type HeadersType = { role: string; uid: string };

export class GqlClientFactory {
  public static client = (
    args: HeadersType
  ): ApolloClient<NormalizedCacheObject> => {
    return new ApolloClient({
      link: from([this._error_link, this._http_link(args)]),
      cache: new InMemoryCache(),

      defaultOptions: {
        watchQuery: {
          fetchPolicy: "cache-and-network",
        },
        query: {
          fetchPolicy: "no-cache",
          errorPolicy: "all",
        },
        mutate: {
          fetchPolicy: "no-cache",
          errorPolicy: "all",
        },
      },
    });
  };

  private static _http_link = (args: {
    role: string;
    uid: string;
  }): ApolloLink => {
    return createHttpLink({
      uri: process.env.GQL_URL,
      headers: {
        "x-hasura-admin-secret": String(process.env.GQL_ADMIN_SECRET),
        "x-hasura-role": args.role,
        "x-hasura-user-id": args.uid,
      },
      fetch: fetch as any,
    });
  };

  private static _error_link = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });
}
