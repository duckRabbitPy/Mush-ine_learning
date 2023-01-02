import { Claims, getSession } from "@auth0/nextjs-auth0";
import { inferAsyncReturnType } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const session = getSession(opts.req, opts.res);
  const user = session?.user;
  return {
    user,
  };
}

export function createTestContext(): { user: Claims | undefined } {
  const user = {
    name: process.env.TEST_USERNAME,
    sub: process.env.TEST_SUB,
  };

  return {
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

export type TestContext = inferAsyncReturnType<typeof createTestContext>;
