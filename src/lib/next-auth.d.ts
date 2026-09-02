import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "COACH" | "MODERATOR";
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: "COACH" | "MODERATOR";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "COACH" | "MODERATOR";
  }
}
