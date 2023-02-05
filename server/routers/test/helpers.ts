/* eslint-disable import/prefer-default-export */
import { z } from "zod";
import { cacheCloudinaryMushrooms } from "../../../scripts/init";
import db from "../../database/connection";
import { getCachedMushroomNames } from "../../database/model";

export function isValidResult(testSubject: any, validationSchema: any) {
  try {
    validationSchema.parse(testSubject);
    return true;
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err);
      console.log("testResult", testSubject);
      return false;
    }
  }
}

export async function freshDatabase() {
  await db.query(
    "DROP TABLE IF EXISTS mushine_learning_user; CREATE TABLE mushine_learning_user (id SERIAL PRIMARY KEY, user_id VARCHAR(50),xp INTEGER);"
  );

  await db.query(
    "DROP TABLE IF EXISTS mushine_training_weightings; CREATE TABLE mushine_training_weightings (id SERIAL PRIMARY KEY, user_id VARCHAR (50), correct_mushroom VARCHAR (50), misidentified_as VARCHAR (50), weight integer, timestamp TIMESTAMP);"
  );

  await db.query(
    "DROP TABLE IF EXISTS mushine_level_snapshots; CREATE TABLE mushine_level_snapshots (id SERIAL PRIMARY KEY, level INTEGER UNIQUE, user_id VARCHAR (50),snapshot JSONB);"
  );

  await db.query(
    "DROP TABLE IF EXISTS mushine_round_metadata; CREATE TABLE mushine_round_metadata (id SERIAL PRIMARY KEY, user_id VARCHAR (50), game_type VARCHAR (50), current_level INTEGER, correct_mushroom VARCHAR (50), correct_answer BOOLEAN, timestamp TIMESTAMP);"
  );

  const allMushroomNames = await getCachedMushroomNames();
  if (allMushroomNames && allMushroomNames.length > 0) return;
  await cacheCloudinaryMushrooms();
}
