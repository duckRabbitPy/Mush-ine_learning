import { z } from "zod";
import getTestMushrooms from "../../utils/server";
import updateScore, { writeTestString } from "../database/model";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
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
  storeUserScore: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        score: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const testString = await updateScore(input.userId, input.score);
      return {
        user: {
          userId: input.userId,
          score: input.score,
        },
      };
    }),
  testMushrooms: publicProcedure
    .input(
      z.object({
        omitArr: z.array(z.string()),
        max: z.number(),
        skip: z.boolean(),
      })
    )
    .query(async ({ input }) => {
      if (input.skip) return [];
      const testMushrooms = await getTestMushrooms(input.omitArr, input.max);
      return testMushrooms;
    }),
});

export type AppRouter = typeof appRouter;
