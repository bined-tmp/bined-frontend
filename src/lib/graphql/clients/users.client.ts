import {
  SelectUniqueUserByEmailDocument,
  SelectUniqueUserByEmailQuery,
  SelectUniqueUserByEmailQueryVariables,
  InsertUsersSignUpPageDocument,
  InsertUsersSignUpPageMutation,
  InsertUsersSignUpPageMutationVariables,
  UpdateUsersEmailVerifiedDocument,
  UpdateUsersEmailVerifiedMutation,
  UpdateUsersEmailVerifiedMutationVariables,
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

  public static insert_user = async (
    variables: InsertUsersSignUpPageMutationVariables,
    client: ApolloClient<NormalizedCacheObject>
  ): Promise<InsertUsersSignUpPageMutation> => {
    const { data, errors } = await client.mutate({
      mutation: InsertUsersSignUpPageDocument,
      variables,
    });

    GqlErrorHandler.checkError(
      "users client @select_unique_user_by_email",
      errors
    );
    if (!data?.insert_users?.returning[0].id)
      throw new Error("users client @insert_user failed to insert");

    return data;
  };

  public static update_user_email_verified = async (
    variables: UpdateUsersEmailVerifiedMutationVariables,
    client: ApolloClient<NormalizedCacheObject>
  ): Promise<UpdateUsersEmailVerifiedMutation> => {
    const { data, errors } = await client.mutate({
      mutation: UpdateUsersEmailVerifiedDocument,
      variables,
    });

    GqlErrorHandler.checkError(
      "users client @select_unique_user_by_email",
      errors
    );
    if (!data?.update_users?.returning[0].id)
      throw new Error(
        "users client @update_user_email_verified failed to update"
      );

    return data;
  };
}
