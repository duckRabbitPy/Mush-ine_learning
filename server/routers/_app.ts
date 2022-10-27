import { number, string, z } from "zod";
import { storedMushrooms } from "../../storedMushrooms";
import getTestMushrooms from "../../utils/server";
import getCommonConfusions, {
  updateScore,
  getScoreByUserId,
  writeTestString,
  createUser,
  updateTrainingData,
  getLevelSnapshot,
  saveLevelSnapshot,
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
    .input(z.object({ user_id: z.string() }))
    .query(async ({ input }) => {
      const userScore = await getScoreByUserId(input.user_id);
      return userScore ?? 0;
    }),
  storeUserScore: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        score: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      let xp = await getScoreByUserId(input.user_id);
      if (!xp) {
        await createUser(input.user_id);
        xp = 0;
      }
      const newXp = xp + input.score;
      const newScore = await updateScore(newXp, input.user_id);
      return {
        user: {
          user_id: input.user_id,
          score: newScore,
        },
      };
    }),
  storeTrainingData: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        trainingData: z.array(
          z.object({
            misidentified_as: z.string().nullable(),
            weightingData: z.record(z.string(), z.number()).nullable(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const lastSession = await updateTrainingData(
        input.trainingData,
        input.user_id
      );
      return lastSession;
    }),
  trainingData: publicProcedure
    .input(
      z.object({
        user_id: z.string().nullable(),
        name: z.string(),
      })
    )
    .query(async ({ input }) => {
      if (!input.user_id) return null;
      const confusions = await getCommonConfusions(input.name, input.user_id);
      return confusions;
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
  saveLevelSnapShot: publicProcedure
    .input(
      z.object({
        user_id: string(),
      })
    )
    .query(async ({ input }) => {
      const mushrooms = storedMushrooms;
      const snapshot = await saveLevelSnapshot(mushrooms, input.user_id);
      return snapshot;
    }),
  downloadLevelSnapShot: publicProcedure
    .input(
      z.object({
        level: number(),
        user_id: string(),
      })
    )
    .query(async ({ input }) => {
      const snapshot = await getLevelSnapshot(input.level, input.user_id);
      return snapshot;
    }),
});

export type AppRouter = typeof appRouter;
