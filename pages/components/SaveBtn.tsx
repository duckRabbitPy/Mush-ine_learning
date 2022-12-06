import { Button, ButtonProps, Text } from "@chakra-ui/react";
import { useCommonTrpc } from "../../hooks/useCommonTrpc";
import { useGameState } from "../../hooks/useGameState";
import { useSound } from "../../hooks/useSound";
import { returnLvl } from "../../utils/client_safe";
import { RoundMetadata, TrainingData } from "../../utils/server_side";

type SaveProps = {
  styles?: ButtonProps;
  score: number;
  trainingResult: [] | TrainingData[];
  gameOver: boolean;
  roundMetaData: [] | RoundMetadata[];
};

const handleSaveBtn = async (
  user_id: string | null,
  currXp: number | null,
  score: number,
  saveTrainingData: any,
  saveRoundMetaData: any,
  saveSnapShot: any,
  saveScore: any,
  trainingResult: TrainingData[],
  roundMetaData: any
) => {
  if (user_id) {
    const preRoundLevel = returnLvl(currXp);
    const postRoundLevel = returnLvl((currXp ?? 0) + score);
    saveScore.mutate({ user_id, score });
    saveTrainingData.mutate({ trainingData: trainingResult, user_id });
    roundMetaData.length > 1 &&
      saveRoundMetaData.mutate({ roundMetadata: roundMetaData, user_id });

    if (preRoundLevel <= postRoundLevel) {
      saveSnapShot.mutate({ user_id: user_id ?? null });
    }
  } else {
    throw new Error("user object lacking sub property");
  }
};

export const SaveBtn = ({
  styles,
  gameOver,
  score,
  trainingResult,
  roundMetaData,
}: SaveProps) => {
  const { user } = useGameState();
  const {
    xpQuery,
    saveRoundMetaData,
    saveScore,
    saveSnapShot,
    saveTrainingData,
  } = useCommonTrpc();
  const user_id = user?.sub;
  const currXp = xpQuery.data;
  const { saveSound } = useSound();
  console.log(saveScore.isSuccess);
  return (
    <>
      <Button
        onClick={() => {
          saveSound?.play();
          handleSaveBtn(
            user_id || null,
            currXp || null,
            score,
            saveTrainingData,
            saveRoundMetaData,
            saveSnapShot,
            saveScore,
            trainingResult,
            roundMetaData
          );
        }}
        w="-moz-fit-content"
        alignSelf="center"
        backgroundColor="#B8E6F3"
        visibility={gameOver && !saveScore.isSuccess ? "visible" : "hidden"}
        {...styles}
      >
        Save score
      </Button>
      <div>
        {gameOver && saveScore.isSuccess && (
          <Text color="white">Score saved! Return to home </Text>
        )}
      </div>
    </>
  );
};

export default SaveBtn;
