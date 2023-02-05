import { number, z } from "zod";
import {
  randomArrItem,
  reduceAnswerCount,
  returnLvl,
} from "../../utils/pureFunctions";
import {
  getForageMushrooms,
  getMushroomImgPaths,
  getMushroomSet,
} from "../../utils/serverSideUtils";
import {
  updateScore,
  getXPByUserId,
  createUser,
  updateTrainingData,
  getLevelSnapshot,
  saveLevelSnapshot,
  updateRoundMetaData,
  getCurrentLevel,
  getRoundMetadata,
  getHeatmapData,
  getMostTroublesome,
  getActivity,
  getCachedMushroomNames,
} from "../database/model";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const appRouter = router({
  getAllMushroomNames: publicProcedure.query(async () => {
    const mushroomNames = await getCachedMushroomNames();
    return mushroomNames;
  }),
  retrieveThumbnailSrcs: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ input }) => {
      const srcPromises = input.map((mushroomNames) => {
        return getMushroomImgPaths(mushroomNames, "low", 1).then((srcArr) => {
          return { [mushroomNames]: srcArr[0] };
        });
      });

      const srcArr = await Promise.all(srcPromises);
      const thumbnails = Object.assign({}, ...srcArr) as Thumbnails;
      return thumbnails;
    }),
  retrieveUserXP: protectedProcedure.query(async ({ ctx }) => {
    const userScore = await getXPByUserId(ctx.user_id);
    return userScore ?? 0;
  }),
  saveGameData: protectedProcedure
    .input(
      z.object({
        score: z.number(),
        trainingData: z.array(
          z.object({
            misidentifiedMushroom: z.string().nullable(),
            weightingData: z.record(z.string(), z.number()).nullable(),
          })
        ),
        roundMetaData: z.array(
          z.object({
            game_type: z.enum(["forage", "tile", "multi"]),
            correct_answer: z.boolean(),
            correct_mushroom: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let xp = await getXPByUserId(ctx.user_id);
      if (!xp) {
        await createUser(ctx.user_id);
        xp = 0;
      }
      const newXp = xp + input.score;
      await updateScore(newXp, ctx.user_id);

      const current_level = await returnLvl(newXp);
      const roundMetadata = input.roundMetaData;
      await updateRoundMetaData(ctx.user_id, current_level ?? 0, roundMetadata);

      const lastGameResult = await updateTrainingData(
        input.trainingData,
        ctx.user_id
      );
      return lastGameResult;
    }),
  retrieveRoundMetadata: protectedProcedure.query(async ({ ctx }) => {
    const currLevel = await getCurrentLevel(ctx.user_id);
    const stats = await getRoundMetadata(ctx.user_id, currLevel ?? 0);

    const forage = reduceAnswerCount(
      stats?.filter((r) => r.game_type === "forage")
    );
    const multi = reduceAnswerCount(
      stats?.filter((r) => r.game_type === "multi")
    );
    const tile = reduceAnswerCount(stats?.filter((r) => r.game_type == "tile"));

    const metaArr = { forage, multi, tile };
    return metaArr;
  }),
  retrieveForageMushrooms: publicProcedure
    .input(
      z.object({
        omitArr: z.array(z.string()),
        maxIncorrect: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      // personalised set based on authed user data
      if (ctx.user_id) {
        const currLevel = (await getCurrentLevel(ctx.user_id)) ?? 0;
        const snapshotData = await getLevelSnapshot(currLevel, ctx.user_id);
        const snapshot = snapshotData?.snapshot;
        const peronalisedForageSet = await getForageMushrooms(
          input.omitArr,
          input.maxIncorrect,
          snapshot
        );
        return peronalisedForageSet;
      } else {
        // standard set for non-authed users
        const standardForageSet = await getForageMushrooms(
          input.omitArr,
          input.maxIncorrect,
          null
        );
        return standardForageSet;
      }
    }),
  retrieveMushroomSet: publicProcedure
    .input(
      z.object({
        omitArr: z.array(z.string()),
        numOptions: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      let snapshot = null;

      if (ctx.user_id) {
        const currLevel = (await getCurrentLevel(ctx.user_id)) ?? 0;
        const snapshotData = await getLevelSnapshot(currLevel, ctx.user_id);
        snapshot = snapshotData?.snapshot;
      }

      const mushroomSet = await getMushroomSet(
        input.omitArr,
        input.numOptions ?? 3,
        snapshot
      );

      return mushroomSet;
    }),
  saveLevelSnapShot: protectedProcedure.mutation(async ({ ctx }) => {
    const mushrooms = await getCachedMushroomNames();
    if (!mushrooms) {
      return null;
    }
    const snapshot = await saveLevelSnapshot(mushrooms, ctx.user_id);
    return snapshot;
  }),
  retrieveLevelSnapShot: protectedProcedure
    .input(
      z
        .object({
          level: number(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const currLevel = (await getCurrentLevel(ctx.user_id)) ?? 0;
      const snapshot = await getLevelSnapshot(
        input?.level ?? currLevel,
        ctx.user_id
      );

      if (!snapshot) {
        return null;
      }
      return snapshot;
    }),
  getHeatMaps: protectedProcedure.query(async ({ ctx }) => {
    const mushroomNames = await getCachedMushroomNames();
    if (!mushroomNames) return null;
    const heatmaps = await getHeatmapData(mushroomNames, ctx.user_id);
    return heatmaps;
  }),
  retrieveActivity: protectedProcedure.query(async ({ ctx }) => {
    const activityhistory = await getActivity(ctx.user_id);
    if (!activityhistory) return null;

    let lastThirtyActive: Record<string, number> = {};

    const maxThirtyDays = activityhistory.slice(0, 30);
    maxThirtyDays.forEach((activityRecord) => {
      const day = new Date(activityRecord.day).toLocaleDateString();
      lastThirtyActive[day as keyof typeof lastThirtyActive] =
        activityRecord.roundcount;
    });

    return lastThirtyActive;
  }),
  getStudyImages: protectedProcedure.query(async ({ ctx }) => {
    const mostTroublesomeData = await getMostTroublesome(ctx.user_id);

    if (!mostTroublesomeData) {
      return null;
    }

    const chosenMushroomName = randomArrItem(mostTroublesomeData);
    const studyImgSrcs = await getMushroomImgPaths(
      chosenMushroomName,
      "high",
      10
    );

    return { studyImgSrcs, chosenMushroomName };
  }),
});

export type AppRouter = typeof appRouter;
