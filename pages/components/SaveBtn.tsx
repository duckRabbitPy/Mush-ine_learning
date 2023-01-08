import {
  Button,
  ButtonProps,
  Text,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCommonTrpc } from "../../hooks/useCommonTrpc";
import { useGameState } from "../../hooks/useGameState";
import { useSound } from "../../hooks/useSound";
import { returnLvl } from "../../utils/pureFunctions";
import { RoundMetadata, TrainingData } from "../../utils/serverSideFunctions";
import { brandColors } from "../_app";
import PostMortem from "./PostMortem";

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
  const [leveledUp, setLeveledUp] = useState(false);
  const { saveSound } = useSound();

  const handleSaveBtn = async () => {
    if (user_id) {
      const preRoundLevel = returnLvl(currXp);
      const postRoundLevel = returnLvl((currXp ?? 0) + score);

      saveScore.mutate({ score });
      saveTrainingData.mutate({ trainingData: trainingResult });
      roundMetaData.length > 1 &&
        saveRoundMetaData.mutate({ roundMetadata: roundMetaData });
      saveSnapShot.mutate();
      if (preRoundLevel < postRoundLevel) {
        setLeveledUp(true);
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
          backgroundColor={brandColors.skyBlue}
          disabled={saveScore.isLoading}
          visibility={gameOver && !saveScore.isSuccess ? "visible" : "hidden"}
          {...styles}
        >
          Save score
        </Button>
      )}

      {gameOver && saveScore.isSuccess && (
        <Text color="white" marginBottom={50}>
          Score saved! Return to home{" "}
        </Text>
      )}

      {leveledUp && (
        <Card bg="white">
          <CardHeader>Leveled up! 🥳</CardHeader>
          <CardBody>
            <iframe
              src="https://giphy.com/embed/Y4rBAwBrTOOggtksBK"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </CardBody>
        </Card>
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

      {gameOver && saveScore.isSuccess && (
        <PostMortem trainingResult={trainingResult} />
      )}
    </>
  );
};

export default SaveBtn;
