import { QueryResult } from "pg";
import db from "./connection";

type mushineLearningUser = {
  id: number;
  user_id: string;
  xp: string;
};

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
      console.log(result.rows);
      return result.rows[0].testStrings;
    })
    .catch((error: Error) => console.log(error));
}

export function createUser(userId: string) {
  return db
    .query(
      "INSERT INTO mushinelearninguser (userId, xp) VALUES ($1, 0) RETURNING *",
      [userId]
    )
    .then((result: QueryResult<Pick<mushineLearningUser, "user_id">>) => {
      return result.rows[0].user_id;
    })
    .catch((error: Error) => console.log(error));
}

export async function updateScore(Score: number, userId: string) {
  return db
    .query(
      "UPDATE mushinelearninguser SET xp = $1 where userId = $2 RETURNING xp;",
      [Score, userId]
    )
    .then((result: QueryResult<Pick<mushineLearningUser, "xp">>) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));
}

export async function getScoreByUserId(userId: string) {
  return db
    .query("SELECT xp from mushineLearningUser where userId = $1", [userId])
    .then((result: QueryResult<Pick<mushineLearningUser, "xp">>) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));
}
