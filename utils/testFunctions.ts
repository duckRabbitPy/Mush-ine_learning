/* eslint-disable import/prefer-default-export */
import { z } from "zod";

export function isValidResult(testSubject: any, validationSchema: any) {
  try {
    validationSchema.parse(testSubject);
    return true;
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err);
      return false;
    }
  }
}
