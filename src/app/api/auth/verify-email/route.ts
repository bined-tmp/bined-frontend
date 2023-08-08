import { auth } from "@/lib/firebase";
import { GqlClientFactory } from "@/lib/graphql/clients/gql.client";
import { UsersClient } from "@/lib/graphql/clients/users.client";
import { applyActionCode, checkActionCode } from "firebase/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const oobCode = url.searchParams.get("oobCode");
    let verifiedEmail: string | null | undefined = null;

    try {
      const info = await checkActionCode(auth, oobCode as string);
      verifiedEmail = info["data"]["email"];
      await applyActionCode(auth, oobCode as string);

      if (verifiedEmail) {
        await UsersClient.update_user_email_verified(
          { emailVerified: new Date(), email: verifiedEmail as string },
          GqlClientFactory.client({
            role: "admin",
            uid: "",
          })
        );
      }
    } catch (error) {
      console.error(error);
    }

    return new Response(null, {
      status: 307,
      headers: { location: "/welcome" },
    });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: 500 });
  }
}
