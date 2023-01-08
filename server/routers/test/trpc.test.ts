import { describe, it, expect } from "vitest";
import { createTestContext } from "../../context";
import { appRouter } from "../_app";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { isValidResult } from "../../../utils/testFunctions";

cloudinary.config({
  cloud_name: import.meta.env.VITE_cloud_name,
  api_key: import.meta.env.VITE_api_key,
  api_secret: import.meta.env.VITE_api_secret,
});

const userWithAuth = createTestContext({ withAuth: true });
const userNoAuth = createTestContext({ withAuth: false });

describe("Auth middleware", async () => {
  it("Error thrown if userNoAuth uses protected route", async () => {
    const caller = appRouter.createCaller(userNoAuth);
    expect(caller.getHeatMaps).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("userWith auth can get mushroomSet for tile and multi games", async () => {
  it("Request successful if userNoAuth uses retrieveMushroomSet", async () => {
    const validationSchema = z.object({
      correctMushroom: z.string().min(1),
      mushroomImgSrcs: z.array(z.string()).min(1),
      options: z.array(z.string()).min(4),
    });

    const caller = appRouter.createCaller(userNoAuth);
    const result = await caller.retrieveMushroomSet({
      numOptions: 4,
      omitArr: [],
    });

    expect(isValidResult(result, validationSchema)).toEqual(true);
  });
});

describe("userWithAuth can retreive mushrooms for forage game", async () => {
  const caller = appRouter.createCaller(userWithAuth);
  const result = await caller.retrieveForageMushrooms({
    omitArr: [],
    maxIncorrect: 3,
  });

  const validationSchema = z.object({
    correctMatch: z.boolean(),
    name: z.string().min(1),
    src: z.string().min(1),
  });

  it("all forage mushroom properties non null", async () => {
    expect(isValidResult(result[0], validationSchema)).toEqual(true);
  });

  it("one forage mushroom has correctMatch set to true", async () => {
    const hasCorrectMatch = result.some((mushroom) => mushroom.correctMatch);
    expect(hasCorrectMatch).toEqual(true);
  });

  it("remaining forage mushrooms have correctMatch set to false", async () => {
    const hasThreefalse =
      result.reduce((acc, curr) => {
        if (curr.correctMatch === false) {
          acc++;
        }
        return acc;
      }, 0) === 3;
    expect(hasThreefalse).toEqual(true);
  });
});

describe("can retreive study images", async () => {
  const validationSchema = z.object({
    chosenMushroomName: z.string().min(1),
    studyImgSrcs: z.array(z.string()).nonempty(),
  });

  it("getStudyImages returns chosenMushroom name and images", async () => {
    const caller = appRouter.createCaller(userWithAuth);
    const result = await caller.getStudyImages();
    expect(isValidResult(result, validationSchema)).toEqual(true);
  });
});

describe("can retreive heatMaps", async () => {
  const validationSchema = z.object({
    correct_answer: z.boolean(),
    timestamp: z.date(),
  });

  it("heatMap heatmap data for horse", async () => {
    // todo create standardised seed script for test db
    const caller = appRouter.createCaller(userWithAuth);
    const result = await caller.getHeatMaps();
    const singleEntry = result["horse"][0];
    expect(isValidResult(singleEntry, validationSchema)).toEqual(true);
  });
});

describe("can retreive daily activity", async () => {
  it("daily activity is record of dates and numbers", async () => {
    const caller = appRouter.createCaller(userWithAuth);
    const validationSchema = z.record(z.number());
    const result = await caller.retrieveActivity();
    expect(isValidResult(result, validationSchema)).toEqual(true);
  });
});

describe("can retreive user score", async () => {
  it("daily activity is record of dates and numbers", async () => {
    const caller = appRouter.createCaller(userWithAuth);
    const validationSchema = z.number();
    const result = await caller.retrieveUserScore();
    expect(isValidResult(result, validationSchema)).toEqual(true);
  });
});
