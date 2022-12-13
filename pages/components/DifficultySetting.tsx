import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { baseDifficulty, tileDifficulty } from "../../hooks/useGameState";

type DifficultyProps = {
  difficultyType: typeof baseDifficulty | typeof tileDifficulty;
  setMaxIncorrect: React.Dispatch<React.SetStateAction<any>>;
  difficultyNum: number;
};

export function DifficultySetting({
  difficultyType,
  setMaxIncorrect,
  difficultyNum,
}: DifficultyProps) {
  return (
    <RadioGroup
      onChange={(e) => setMaxIncorrect(Number(e))}
      value={String(difficultyNum)}
      color="white"
    >
      <Stack direction="row" justifyContent="center">
        <Radio value={String(difficultyType.easy)}>Easy</Radio>
        <Radio value={String(difficultyType.medium)}>Medium</Radio>
        <Radio value={String(difficultyType.hard)}>Hard</Radio>
        <Radio value={String(difficultyType.pro)}>Pro</Radio>
      </Stack>
    </RadioGroup>
  );
}

export default DifficultySetting;
