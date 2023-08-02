import { NextAuthOptions, getServerSession } from "next-auth";
import { HasuraAdapter } from "next-auth-hasura-adapter";
import GoogleProvider from "next-auth/providers/google";
// import { UsersClient } from "./graphql/clients/users.client";
// import { GqlClientFactory } from "./graphql/clients/gql.client";
import * as jsonwebtoken from "jsonwebtoken";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: HasuraAdapter({
    adminSecret: "password",
    endpoint: "http://graphql-engine:8080/v1/graphql",
  }),
  session: {
    strategy: "jwt",
  },
  secret: process.env.SECRET,
  jwt: {
    encode: ({ secret, token }) => {
      const encodedToken = jsonwebtoken.sign(token!, secret, {
        algorithm: "HS256",
      });
      return encodedToken;
    },
    decode: async ({ secret, token }) => {
      const decodedToken = jsonwebtoken.verify(token!, secret, {
        algorithms: ["HS256"],
      });
      return decodedToken as JWT;
    },
    // encode: async ({ secret, token }) => {
    //   const jwtClaims = {
    //     sub: token?.id.toString(),
    //     name: token?.name,
    //     email: token?.email,
    //     iat: Date.now() / 1000,
    //     exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    //     "https://hasura.io/jwt/claims": {
    //       "x-hasura-allowed-roles": ["user"],
    //       "x-hasura-default-role": "user",
    //       "x-hasura-role": "user",
    //       "x-hasura-user-id": token?.id,
    //     },
    //   };
    //   const encodedToken = jsonwebtoken.sign(jwtClaims, secret, {
    //     algorithm: "HS256",
    //   });
    //   return encodedToken;
    // },
    // decode: async ({ secret, token }) => {
    //   const decodedToken = jsonwebtoken.verify(token!, secret, {
    //     algorithms: ["HS256"],
    //   });
    //   return decodedToken as JWT;
    // },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // async session({ token, session }) {
    //   if (token) {
    //     session.user.id = token.id;
    //     session.user.name = token.name;
    //     session.user.email = token.email;
    //     session.user.image = token.picture;
    //     session.user.username = token.username;
    //   }

    //   return session;
    // },

    // async session({ token, session }) {
    //   const encodedToken = jsonwebtoken.sign(
    //     token,
    //     process.env.SECRET as string,
    //     {
    //       algorithm: "HS256",
    //     }
    //   );
    //   session.user.id = token.id;
    //   session.user.token = encodedToken;
    //   return Promise.resolve(session);
    // },

    session: async ({ session, token }) => {
      const encodedToken = jsonwebtoken.sign(
        token,
        process.env.SECRET as string,
        {
          algorithm: "HS256",
        }
      );
      if (session?.user) {
        session.user.id = token.sub!;
        session.user.token = encodedToken;
      }
      return session;
    },

    // async jwt({ token, user }) {
    //   const response = await UsersClient.select_unique_user_by_email(
    //     { email: token.email as string },
    //     GqlClientFactory.client({
    //       role: "admin",
    //       uid: "",
    //     })
    //   );

    //   const dbUser = response.users[0];

    //   if (!dbUser) {
    //     token.id = user!.id;
    //     return token;
    //   }

    //   return {
    //     id: dbUser.id,
    //     name: dbUser.name,
    //     email: dbUser.email,
    //     picture: dbUser.image,
    //     username: dbUser.username,
    //   };
    // },

    async jwt({ token }) {
      return {
        ...token,
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-default-role": "user",
          "x-hasura-role": "user",
          "x-hasura-user-id": token.sub,
        },
      };
    },

    redirect() {
      return "/";
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
