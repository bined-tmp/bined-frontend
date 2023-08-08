import { NextAuthOptions, getServerSession } from "next-auth";
import { HasuraAdapter } from "next-auth-hasura-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { UsersClient } from "./graphql/clients/users.client";
import { GqlClientFactory } from "./graphql/clients/gql.client";
import * as jsonwebtoken from "jsonwebtoken";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const authOptions: NextAuthOptions = {
  adapter: HasuraAdapter({
    endpoint: String(process.env.HASURA_GQL_URL),
    adminSecret: String(process.env.HASURA_ADMIN_SECRET),
  }),
  session: {
    strategy: "jwt",
  },
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials): Promise<any> {
        const response = await UsersClient.select_unique_user_by_email(
          { email: (credentials as any).email as string },
          GqlClientFactory.client({
            role: "admin",
            uid: "",
          })
        );

        const dbUser = response.users[0];
        if (dbUser) {
          return await signInWithEmailAndPassword(
            auth,
            (credentials as any).email || "",
            (credentials as any).password || ""
          )
            .then((userCredential) => {
              if (userCredential.user) {
                return userCredential.user;
              }
              return null;
            })
            .catch((error) => console.log(error))
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(errorCode);
              console.log(errorMessage);
            });
        } else {
          const data = await UsersClient.insert_user(
            { email: (credentials as any).email as string },
            GqlClientFactory.client({
              role: "admin",
              uid: "",
            })
          );
          const token = data.insert_users?.returning[0];
          return token;
        }
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      const encodedToken = jsonwebtoken.sign(
        token,
        process.env.SECRET as string,
        {
          algorithm: "HS256",
        }
      );
      if (session?.user) {
        session.user.id = token.id;
        session.user.token = encodedToken;
      }
      return session;
    },
    async jwt({ token }) {
      const response = await UsersClient.select_unique_user_by_email(
        { email: token.email as string },
        GqlClientFactory.client({
          role: "admin",
          uid: "",
        })
      );
      const dbUser = response.users[0];

      if (!dbUser) {
        return {
          ...token,
          "https://hasura.io/jwt/claims": {
            "x-hasura-allowed-roles": ["user"],
            "x-hasura-default-role": "user",
            "x-hasura-role": "user",
            "x-hasura-user-id": token.sub,
          },
        };
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        username: dbUser.username,
        emailVerified: dbUser.emailVerified,
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-default-role": "user",
          "x-hasura-role": "user",
          "x-hasura-user-id": dbUser.id,
        },
      };
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
