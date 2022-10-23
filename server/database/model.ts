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
      console.log(result.rows);
      return result.rows[0].testStrings;
    })
    .catch((error: Error) => console.log(error));
}

export function createUser(userId: string): Promise<string> {
  return db
    .query(
      "INSERT INTO mushinelearninguser (userId, xp) VALUES ($1, 0) RETURNING *",
      [userId]
    )
    .then((result) => {
      return result.rows[0].userId;
    })
    .catch((error: Error) => console.log(error));
}

export async function updateScore(Score: number, userId: string) {
  return db
    .query(
      "UPDATE mushinelearninguser SET xp = $1 where userId = $2 RETURNING xp;",
      [Score, userId]
    )
    .then((result) => {
      return result.rows[0].testStrings;
    })
    .catch((error: Error) => console.log(error));
}

export async function getScoreByUserId(userId: string) {
  return db
    .query("SELECT xp from mushineLearningUser where userId = $1", [userId])
    .then((result) => {
      return result.rows[0].xp;
    })
    .catch((error: Error) => console.log(error));
}
