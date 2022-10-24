import { z } from "zod";
import getTestMushrooms from "../../utils/server";
import {
  updateScore,
  getScoreByUserId,
  writeTestString,
  createUser,
} from "../database/model";
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
  retrieveUserScore: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const userScore = await getScoreByUserId(input.userId);
      return userScore;
    }),
  storeUserScore: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        score: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      let xp = await getScoreByUserId(input.userId);
      if (!xp) {
        await createUser(input.userId);
        xp = 0;
      }
      const newXp = xp + input.score;
      const newScore = await updateScore(newXp, input.userId);
      return {
        user: {
          userId: input.userId,
          score: newScore,
        },
      };
    }),
  testMushrooms: publicProcedure
    .input(
      z.object({
        omitArr: z.array(z.string()),
        max: z.number(),
      })
    )
    .query(async ({ input }) => {
      const testMushrooms = await getTestMushrooms(input.omitArr, input.max);
      return testMushrooms;
    }),
});

export type AppRouter = typeof appRouter;
