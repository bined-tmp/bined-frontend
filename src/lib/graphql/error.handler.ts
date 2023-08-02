import { Logger } from "@/common/logger";
import { GraphQLError } from "graphql";

export class GqlErrorHandler {
  public static checkError = (
    methodName: string,
    errors: readonly GraphQLError[] | undefined
  ): void => {
    if (typeof errors === "undefined") return;
    if (process.env.NODE_ENV !== "production") console.log(errors);

    for (const error of errors) {
      let msg = "";

      if (typeof error.extensions?.path !== "undefined")
        msg += "path: " + error.extensions.path + "\n";
      if (typeof error.extensions?.code !== "undefined")
        msg += "code: " + error.extensions.code + "\n";
      if (typeof error.extensions?.problems !== "undefined")
        msg += "problems: " + error.extensions.problems + "\n";
      if (typeof error.message !== "undefined")
        msg += "message: " + error.message + "\n";
      if (msg === "") msg = String(error);

      Logger.error(methodName, "Something graphql error...", msg);
    }

    throw new Error(`[${methodName}] Something graphql error...`);
  };
}
