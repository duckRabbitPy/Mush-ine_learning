import { getSession } from "@auth0/nextjs-auth0";
import { inferAsyncReturnType } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const session = getSession(opts.req, opts.res);
  const user = session?.user;
  return {
    user,
  };
}

export function createTestContext({
  withAuth,
  asSecondUser,
}: {
  withAuth: boolean;
  asSecondUser?: boolean;
}) {
  const user1 = {
    name: withAuth ? process.env.TEST_USERNAME : undefined,
    sub: withAuth ? process.env.TEST_SUB : undefined,
  };

  const user2 = {
    name: withAuth ? `${process.env.TEST_USERNAME}2` : undefined,
    sub: withAuth ? `${process.env.TEST_SUB}2` : undefined,
  };
  const user = asSecondUser ? user2 : user1;
  return {
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
