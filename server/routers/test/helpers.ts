/* eslint-disable import/prefer-default-export */
import { z } from "zod";
import db from "../../database/connection";

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
    "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;"
  );

  await db.query(
    "CREATE TABLE mushine_learning_user (id SERIAL PRIMARY KEY, user_id VARCHAR(50),xp INTEGER);"
  );
  await db.query(
    "CREATE TABLE mushine_training_mushrooms (id SERIAL PRIMARY KEY, name VARCHAR (50), mushroom_id UUID);"
  );
  await db.query(
    "CREATE TABLE mushine_training_weightings (id SERIAL PRIMARY KEY, user_id VARCHAR (50), correct_mushroom VARCHAR (50), misidentified_as VARCHAR (50), weight integer, timestamp TIMESTAMP);"
  );
  await db.query(
    "CREATE TABLE mushine_level_snapshots (id SERIAL PRIMARY KEY, level INTEGER, user_id VARCHAR (50),snapshot JSONB);"
  );

  await db.query(
    "CREATE TABLE mushine_round_metadata (id SERIAL PRIMARY KEY, user_id VARCHAR (50), game_type VARCHAR (50), current_level INTEGER, correct_mushroom VARCHAR (50), correct_answer BOOLEAN, timestamp TIMESTAMP);"
  );
}
