import { number, z } from "zod";
import { promises as fs } from "fs";
import { randomArrItem, reduceAnswerCount } from "../../utils/pureFunctions";
import {
  getForageMushrooms,
  getMushroomSet,
  getStoredMushroomNames,
} from "../../utils/serverSideFunctions";
import {
  updateScore,
  getScoreByUserId,
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
} from "../database/model";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { v2 as cloudinary } from "cloudinary";

import path from "path";

export const appRouter = router({
  getMushroomNames: publicProcedure.query(async () => {
    const jsonDirectory = path.join(process.cwd(), "server/fileSystemData");
    const mushroomNames = await fs.readFile(
      jsonDirectory + "/mushroomNames.json",
      "utf8"
    );

    return JSON.parse(mushroomNames).mushroomNames as string[];
  }),
  retrieveUserScore: protectedProcedure.query(async ({ ctx }) => {
    const userScore = await getScoreByUserId(ctx.user_id);
    return userScore ?? 0;
  }),
  storeUserScore: protectedProcedure
    .input(
      z.object({
        score: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let xp = await getScoreByUserId(ctx.user_id);
      if (!xp) {
        await createUser(ctx.user_id);
        xp = 0;
      }
      const newXp = xp + input.score;
      const newScore = await updateScore(newXp, ctx.user_id);
      return {
        user: {
          user_id: ctx.user_id,
          score: newScore,
        },
      };
    }),
  storeTrainingData: protectedProcedure
    .input(
      z.object({
        trainingData: z.array(
          z.object({
            misidentifiedMushroom: z.string().nullable(),
            weightingData: z.record(z.string(), z.number()).nullable(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lastSession = await updateTrainingData(
        input.trainingData,
        ctx.user_id
      );
      return lastSession;
    }),
  storeRoundMetadata: protectedProcedure
    .input(
      z.object({
        roundMetadata: z.array(
          z.object({
            game_type: z.enum(["forage", "tile", "multi"]),
            correct_answer: z.boolean(),
            correct_mushroom: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const current_level = await getCurrentLevel(ctx.user_id);
      const roundMetadata = input.roundMetadata;
      await updateRoundMetaData(ctx.user_id, current_level ?? 0, roundMetadata);
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
    const mushrooms = await getStoredMushroomNames();
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
    const mushroomNames = await getStoredMushroomNames();
    const heatmaps = await getHeatmapData(mushroomNames, ctx.user_id);
    return heatmaps;
  }),
  retrieveActivity: protectedProcedure.query(async ({ ctx }) => {
    const activityhistory = await getActivity(ctx.user_id);

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

    const cloudinaryResult = await cloudinary.api.resources({
      type: "upload",
      prefix: `mushroom_images/${chosenMushroomName}`,
      max_results: 10,
    });

    const images = cloudinaryResult.resources as CloudImage[];

    const studyImgSrcs = images
      .map((img: CloudImage) => img.url)
      .flatMap((f) => (f ? [f] : []));
    return { studyImgSrcs, chosenMushroomName };
  }),
});

export type AppRouter = typeof appRouter;
