import { QueryResult } from "pg";
import { TrainingData } from "../../pages/forage";
import db from "./connection";

export function readTestString(): Promise<string> {
  return db
    .query("SELECT * from mushineLearning")
    .then((result) => {
      console.log(result.rows);
      return result.rows[0].testStrings;
    })
    .catch((error: Error) => console.log(error));
}

export function writeTestString(testString: string): Promise<string> {
  return db
    .query(
      "INSERT INTO mushineLearning (testStrings) VALUES ($1) RETURNING *",
      [testString]
    )
    .then((result) => {
      return result.rows[0].testStrings;
    })
    .catch((error: Error) => console.log(error));
}

type mushine_learning_user = {
  id: number;
  user_id: string;
  xp: number;
};

export function createUser(user_id: string) {
  return db
    .query(
      "INSERT INTO mushine_learning_user (user_id, xp) VALUES ($1, 0) RETURNING *",
      [user_id]
    )
    .then((result: QueryResult<Pick<mushine_learning_user, "user_id">>) => {
      return result.rows[0].user_id;
    })
    .catch((error: Error) => console.log(error));
}

export async function updateScore(Score: number, user_id: string) {
  return db
    .query(
      "UPDATE mushine_learning_user SET xp = $1 where user_id = $2 RETURNING xp;",
      [Score, user_id]
    )
    .then((result: QueryResult<Pick<mushine_learning_user, "xp">>) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));
}

export async function getScoreByUserId(user_id: string) {
  return db
    .query("SELECT xp from mushine_learning_user where user_id = $1", [user_id])
    .then((result: QueryResult<Pick<mushine_learning_user, "xp">>) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));
}

type mushine_training_weightings = {
  id: number;
  name: string;
  mushroom_id: string;
};

export async function updateTrainingData(
  trainingData: TrainingData[],
  user_id: string
) {
  console.log(trainingData, "trainingData");
  for (const lesson of trainingData) {
    if (lesson.weightingData) {
      const weightEntries = Object.entries(lesson.weightingData);

      for (const weightEntry of weightEntries) {
        const misidentifiedAs = lesson.misidentified_as;
        const name = weightEntry[0];
        const weight = weightEntry[1];
        const mushroom_id = await db
          .query(
            "SELECT mushroom_id from mushine_training_mushrooms WHERE name = $1",
            [name]
          )
          .then(
            (
              result: QueryResult<
                Pick<mushine_training_weightings, "mushroom_id">
              >
            ) => {
              return result.rows[0].mushroom_id;
            }
          )
          .catch((error: Error) => console.log(error));

        const misidentified_as = await db
          .query(
            "SELECT mushroom_id from mushine_training_mushrooms WHERE name = $1",
            [misidentifiedAs]
          )
          .then(
            (
              result: QueryResult<
                Pick<mushine_training_weightings, "mushroom_id">
              >
            ) => {
              console.log(result);
              return result.rows[0].mushroom_id;
            }
          )
          .catch((error: Error) => console.log(error));

        // insert into mushine_training_weightings
        await db
          .query(
            "INSERT INTO mushine_training_weightings (user_id, name, mushroom_id, misidentified_as, weight) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [user_id, name, mushroom_id, misidentified_as, weight]
          )
          .then((result: QueryResult<mushine_training_weightings>) => {
            return result.rows[0];
          })
          .catch((error: Error) => console.log(error));
      }
    }
  }

  return trainingData;
}
