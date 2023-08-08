import type { Session, User, Profile } from "next-auth";
import type { JWT } from "next-auth/jwt";

type UserId = string;

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
    username?: string | null;
    emailVerified: any;
  }
}

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      username?: string | null;
      token: string;
    };
  }
}
