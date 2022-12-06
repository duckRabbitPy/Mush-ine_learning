import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { baseDifficulty, tileDifficulty } from "../../hooks/useGameState";

type DifficultyProps = {
  difficultyType: typeof baseDifficulty | typeof tileDifficulty;
  setDifficulty: React.Dispatch<React.SetStateAction<any>>;
  difficultyNum: number;
};

export function DifficultySetting({
  difficultyType,
  setDifficulty,
  difficultyNum,
}: DifficultyProps) {
  return (
    <RadioGroup
      onChange={(e) => setDifficulty(Number(e))}
      value={difficultyNum}
      color="white"
    >
      <Stack direction="row" justifyContent="center">
        <Radio value={difficultyType.easy}>Easy</Radio>
        <Radio value={difficultyType.medium}>Medium</Radio>
        <Radio value={difficultyType.hard}>Hard</Radio>
        <Radio value={difficultyType.pro}>Pro</Radio>
      </Stack>
    </RadioGroup>
  );
}

export default DifficultySetting;
