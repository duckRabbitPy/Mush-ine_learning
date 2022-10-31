import { number, string, z } from "zod";
import {
  getTestMushrooms,
  getCloudMushrooms,
  getMushroomSet,
} from "../../utils/server";
import getCommonConfusions, {
  updateScore,
  getScoreByUserId,
  createUser,
  updateTrainingData,
  getLevelSnapshot,
  saveLevelSnapshot,
} from "../database/model";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  retrieveUserScore: publicProcedure
    .input(z.object({ user_id: z.string().nullable() }))
    .query(async ({ input }) => {
      if (!input.user_id) {
        return 0;
      }
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
            misidentifiedMushroom: z.string().nullable(),
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
  mushroomSet: publicProcedure
    .input(
      z.object({
        omitArr: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      const mushroomSet = await getMushroomSet(input.omitArr);
      return mushroomSet;
    }),
  saveLevelSnapShot: publicProcedure
    .input(
      z.object({
        user_id: string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      if (!input.user_id) {
        return null;
      }
      const mushrooms = await getCloudMushrooms();
      const snapshot = await saveLevelSnapshot(mushrooms, input.user_id);
      return snapshot;
    }),
  downloadLevelSnapShot: publicProcedure
    .input(
      z.object({
        level: number(),
        user_id: string().nullable(),
      })
    )
    .query(async ({ input }) => {
      if (!input.user_id) {
        return null;
      }
      const snapshot = await getLevelSnapshot(input.level, input.user_id);

      if (!snapshot) {
        return null;
      }
      return snapshot;
    }),
});

export type AppRouter = typeof appRouter;
