import { TRPCError, initTRPC } from "@trpc/server";
import { Context } from "./context";

const t = initTRPC.context<Context>().create();

const authChecker = t.middleware(({ ctx, next }) => {
  if (!ctx.user?.sub) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
  return next({
    ctx: {
      user_id: ctx.user.sub as string,
    },
  });
});

const noCheck = t.middleware(({ ctx, next }) => {
  const user_id = ctx.user?.sub as string | undefined;
  return next({
    ctx: {
      user_id,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure.use(noCheck);
export const protectedProcedure = t.procedure.use(authChecker);
