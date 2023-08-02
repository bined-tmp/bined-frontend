import {
  SelectUniqueUserByEmailDocument,
  SelectUniqueUserByEmailQuery,
  SelectUniqueUserByEmailQueryVariables,
} from "@/graphql/generated/gql.types";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { GqlErrorHandler } from "../error.handler";

export class UsersClient {
  public static select_unique_user_by_email = async (
    variables: SelectUniqueUserByEmailQueryVariables,
    client: ApolloClient<NormalizedCacheObject>
  ): Promise<SelectUniqueUserByEmailQuery> => {
    const { data, errors } = await client.query({
      query: SelectUniqueUserByEmailDocument,
      variables,
    });

    GqlErrorHandler.checkError(
      "users client @select_unique_user_by_email",
      errors
    );
    if (!data.users)
      throw new Error(
        "users client @select_unique_user_by_email failed to select"
      );

    return data;
  };
}
