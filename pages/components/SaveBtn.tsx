import {
  Button,
  ButtonProps,
  Text,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { useCommonTrpc } from "../../hooks/useCommonTrpc";
import { useGameState } from "../../hooks/useGameState";
import { useSound } from "../../hooks/useSound";
import { returnLvl } from "../../utils/pureFunctions";
import { RoundMetadata, TrainingData } from "../../utils/serverSideFunctions";

type SaveProps = {
  styles?: ButtonProps;
  score: number;
  trainingResult: [] | TrainingData[];
  gameOver: boolean;
  roundMetaData: [] | RoundMetadata[];
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

  const handleSaveBtn = async () => {
    if (user_id) {
      const preRoundLevel = returnLvl(currXp);
      const postRoundLevel = returnLvl((currXp ?? 0) + score);
      saveScore.mutate({ score });
      saveTrainingData.mutate({ trainingData: trainingResult });
      roundMetaData.length > 1 &&
        saveRoundMetaData.mutate({ roundMetadata: roundMetaData });

      if (preRoundLevel <= postRoundLevel) {
        saveSnapShot.mutate();
      }
    }
  };

  return (
    <>
      {user_id && (
        <Button
          onClick={() => {
            saveSound?.play();
            handleSaveBtn();
          }}
          w="-moz-fit-content"
          alignSelf="center"
          backgroundColor="#B8E6F3"
          disabled={saveScore.isLoading}
          visibility={gameOver && !saveScore.isSuccess ? "visible" : "hidden"}
          {...styles}
        >
          Save score
        </Button>
      )}

      {!user_id && gameOver && (
        <Card bg="white">
          <CardHeader>Enjoying the games? 🥳 🍄</CardHeader>
          <CardBody>
            Sign in via the home page to earn experience, level up, get
            personalised insights and receive identification study guidance.
          </CardBody>
        </Card>
      )}
      <div>
        {gameOver && saveScore.isSuccess && (
          <Text color="white">Score saved! Return to home </Text>
        )}
      </div>
    </>
  );
};

export default SaveBtn;
