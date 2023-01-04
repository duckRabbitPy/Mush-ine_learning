import { describe, it, expect } from "vitest";
import { createTestContext } from "../../context";
import { appRouter } from "../_app";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: import.meta.env.VITE_cloud_name,
  api_key: import.meta.env.VITE_api_key,
  api_secret: import.meta.env.VITE_api_secret,
});

describe("can retreive mushrooms for forage game", async () => {
  const user = createTestContext();
  const caller = appRouter.createCaller(user);
  const result = await caller.retrieveForageMushrooms({
    omitArr: [],
    maxIncorrect: 3,
  });

  it("all forage mushroom properties non null", async () => {
    const validationSchema = z.object({
      correctMatch: z.boolean(),
      name: z.string().min(1),
      src: z.string().min(1),
    });
    expect(validationSchema.parse(result[0])).toBeTruthy;
  });

  it("one forage mushroom has correctMatch set to true", async () => {
    expect.assertions(1);
    const hasCorrectMatch = result.some((mushroom) => mushroom.correctMatch);
    expect(hasCorrectMatch).toEqual(true);
  });

  it("remaining forage mushrooms have correctMatch set to false", async () => {
    expect.assertions(1);
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
  it("getStudyImages returns chosenMushroom name and images", async () => {
    const user = createTestContext();
    const caller = appRouter.createCaller(user);
    const result = await caller.getStudyImages();

    const validationSchema = z.object({
      chosenMushroomName: z.string().min(1),
      studyImgSrcs: z.array(z.string()).nonempty(),
    });

    expect(validationSchema.parse(result)).toBeTruthy;
  });
});
