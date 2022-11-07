import { Button, Flex, Text, SimpleGrid, Spinner } from "@chakra-ui/react";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import { RoundMetadata, TrainingData } from "../utils/server_side";
import { ProgressIndicator } from "./components/Progress";
import { reactQueryConfig } from "./forage";
import { returnLvl } from "../utils/client_safe";
import { useGameState } from "../hooks/useGameState";
import { useCommonTrpc } from "../hooks/useCommonTrpc";
import { TopLevelWrapper } from "./components/TopLvlWrapper";

const Multi = () => {
  const {
    xpQuery,
    saveRoundMetaData,
    saveScore,
    saveSnapShot,
    saveTrainingData,
  } = useCommonTrpc();

  const {
    trainingResult,
    setTrainingResult,
    roundMetaData,
    setRoundMetaData,
    round,
    setRound,
    omitArr,
    setOmitArr,
    progress,
    setProgress,
    score,
    setScore,
    user,
  } = useGameState();

  const getMushroomSet = trpc.mushroomSet.useQuery(
    {
      omitArr,
      user_id: user?.sub ?? null,
      numOptions: 3,
    },
    {
      enabled: round !== 0 && round !== 4,
      ...reactQueryConfig,
    }
  );
  const correctMushroom = getMushroomSet.data?.correctMushroom;
  const options = getMushroomSet.data?.options;
  const gameOver = round > 3;

  const handleSelection = async (name: string) => {
    if (name === correctMushroom) {
      setScore(score + 10);

      setProgress((prev) => {
        return prev.concat(true);
      });
    } else if (name !== correctMushroom) {
      const trainingDataCopy = trainingResult?.slice() ?? [];
      const newResult: TrainingData = {
        misidentifiedMushroom: correctMushroom ?? null,
        weightingData: { [name]: 20 },
      };
      trainingDataCopy.push(newResult);
      setTrainingResult(trainingDataCopy);
      setProgress((prev) => {
        return prev.concat(false);
      });
    }

    setRound(round + 1);

    correctMushroom &&
      setRoundMetaData((prev: RoundMetadata[]) => {
        return prev.concat({
          correct_mushroom: correctMushroom,
          correct_answer: name === correctMushroom,
          game_type: "multi",
        });
      });

    setOmitArr((prev) => {
      if (omitArr && correctMushroom) {
        const newOmitArr = [...prev, correctMushroom];
        return newOmitArr;
      }
      return prev;
    });
  };

  const handleSaveBtn = async () => {
    const user_id = user?.sub;
    if (user_id) {
      const preRoundLevel = returnLvl(xpQuery.data);
      const postRoundLevel = returnLvl((xpQuery.data ?? 0) + score);
      saveScore.mutate({ user_id, score });
      saveTrainingData.mutate({ trainingData: trainingResult, user_id });
      roundMetaData.length > 1 &&
        saveRoundMetaData.mutate({ roundMetadata: roundMetaData, user_id });

      if (preRoundLevel <= postRoundLevel) {
        saveSnapShot.mutate({ user_id: user?.sub ?? null });
      }
    } else {
      throw new Error("user object lacking sub property");
    }
  };

  return (
    <TopLevelWrapper backgroundColor="#091122">
      <Flex gap={5} direction="column" alignItems="center">
        <HomeBtn w="-moz-fit-content" mt={3} />
        <Text color="white"> Multi Quiz</Text>
        <Flex gap={2} direction={"column"}>
          {round < 1 && (
            <Button
              onClick={() => setRound(round + 1)}
              backgroundColor="#B8E6F3"
            >
              Start
            </Button>
          )}
          {round > 0 && !getMushroomSet.isRefetching && (
            <Flex gap={2}>
              {getMushroomSet.isLoading && !gameOver && <Spinner />}

              <SimpleGrid columns={3} gap={1}>
                {getMushroomSet.data?.mushroomSet.map((src) => {
                  return (
                    <Image
                      key={src}
                      src={src}
                      alt="testMushroom"
                      height={150}
                      width={150}
                    />
                  );
                })}
              </SimpleGrid>

              <Flex direction={"column"} gap={1}>
                <ProgressIndicator
                  round={round}
                  score={score}
                  progress={progress}
                />

                {gameOver && !saveScore.isSuccess && (
                  <Button
                    onClick={handleSaveBtn}
                    w="-moz-fit-content"
                    alignSelf="center"
                    backgroundColor="#B8E6F3"
                  >
                    Save score
                  </Button>
                )}
                {round > 0 &&
                  options?.map((name) => (
                    <Button
                      key={name}
                      onClick={() => handleSelection(name)}
                      backgroundColor="#B8E6F3"
                    >
                      {name}
                    </Button>
                  ))}
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    </TopLevelWrapper>
  );
};

export default Multi;
