import { z } from "zod";
import { writeTestString } from "../database/model";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ input }) => {
      return {
        greeting: `hello ${input?.text ?? "world"}`,
      };
    }),
  goodBye: publicProcedure
    .input(
      z.object({
        text: z.string().nullish(),
      })
    )
    .query(({ input }) => {
      return {
        farewell: `goodbye ${input?.text ?? "world"}`,
      };
    }),
  getUserInfo: publicProcedure
    .input(
      z.object({
        name: z.string(),
        score: z.number().nullish(),
        ranking: z.number(),
        testString: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const testString = await writeTestString(input.testString);
      return {
        user: {
          name: input.name,
          score: input.score,
          ranking: input.ranking,
          testString: testString,
        },
      };
    }),
});

export type AppRouter = typeof appRouter;
