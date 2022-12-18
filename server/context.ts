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

export type Context = inferAsyncReturnType<typeof createContext>;
