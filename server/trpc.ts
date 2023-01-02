import { TRPCError, initTRPC } from "@trpc/server";
import { Context, TestContext } from "./context";

function getContext(isTest: boolean) {
  if (isTest) {
    return initTRPC.context<TestContext>().create();
  } else {
    return initTRPC.context<Context>().create();
  }
}

const t = getContext(!!process.env.VITEST);

const authChecker = t.middleware(({ ctx, next }) => {
  console.log(ctx);
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

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authChecker);
