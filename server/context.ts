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

export function createTestContext({ withAuth }: { withAuth: boolean }) {
  const user = {
    name: withAuth ? process.env.TEST_USERNAME : undefined,
    sub: withAuth ? process.env.TEST_SUB : undefined,
    isTest: true,
  };

  return {
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
