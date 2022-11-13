import { number, string, z } from "zod";
import { reduceAnswerCount } from "../../utils/client_safe";
import {
  getTestMushrooms,
  getCloudMushrooms,
  getMushroomSet,
} from "../../utils/server_side";
import {
  getCommonConfusions,
  updateScore,
  getScoreByUserId,
  createUser,
  updateTrainingData,
  getLevelSnapshot,
  saveLevelSnapshot,
  updateRoundMetaData,
  getCurrentLevel,
  getRoundMetadata,
  summedWeights,
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
  storeRoundMetadata: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        roundMetadata: z.array(
          z.object({
            game_type: z.enum(["forage", "tile", "multi"]),
            correct_answer: z.boolean(),
            correct_mushroom: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const current_level = await getCurrentLevel(input.user_id);
      const roundMetadata = input.roundMetadata;
      await updateRoundMetaData(
        input.user_id,
        current_level ?? 0,
        roundMetadata
      );
    }),
  retrieveRoundMetadata: publicProcedure
    .input(
      z.object({
        user_id: z.string().nullable(),
      })
    )
    .query(async ({ input }) => {
      if (!input.user_id) {
        return null;
      }
      const currLevel = await getCurrentLevel(input.user_id);
      const stats = await getRoundMetadata(input.user_id, currLevel ?? 0);
      const forage = reduceAnswerCount(
        stats?.filter((r) => r.game_type === "forage")
      );
      const multi = reduceAnswerCount(
        stats?.filter((r) => r.game_type === "multi")
      );
      const tile = reduceAnswerCount(
        stats?.filter((r) => r.game_type == "tile")
      );

      const metaArr = { forage, multi, tile };
      return metaArr;
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
        maxIncorrect: z.number(),
        user_id: z.string().nullable(),
      })
    )
    .query(async ({ input }) => {
      let snapshot = null as Record<string, summedWeights> | undefined | null;
      if (input.user_id) {
        const currLevel = (await getCurrentLevel(input.user_id)) ?? 0;
        const snapshotData = await getLevelSnapshot(currLevel, input.user_id);
        console.log(snapshotData?.snapshot);
        snapshot = snapshotData?.snapshot;
      }
      const testMushrooms = await getTestMushrooms(
        input.omitArr,
        input.maxIncorrect,
        snapshot
      );
      return testMushrooms;
    }),
  mushroomSet: publicProcedure
    .input(
      z.object({
        omitArr: z.array(z.string()),
        numOptions: z.number().optional(),
        user_id: z.string().nullable(),
      })
    )
    .query(async ({ input }) => {
      let snapshot = null;

      if (input.user_id) {
        const currLevel = (await getCurrentLevel(input.user_id)) ?? 0;
        const snapshotData = await getLevelSnapshot(currLevel, input.user_id);
        snapshot = snapshotData?.snapshot;
      }

      const mushroomSet = await getMushroomSet(
        input.omitArr,
        input.numOptions ?? 3,
        snapshot
      );

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
        level: number().optional(),
        user_id: string().nullable(),
      })
    )
    .query(async ({ input }) => {
      if (!input.user_id) {
        return null;
      }
      const currLevel = (await getCurrentLevel(input.user_id)) ?? 0;
      const snapshot = await getLevelSnapshot(
        input.level ?? currLevel,
        input.user_id
      );

      if (!snapshot) {
        return null;
      }
      return snapshot;
    }),
});

export type AppRouter = typeof appRouter;
