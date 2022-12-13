import { Button, Flex, Heading, SimpleGrid, Spinner } from "@chakra-ui/react";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import { RoundMetadata, TrainingData } from "../utils/server_side";
import { ProgressIndicator } from "./components/Progress";
import { reactQueryConfig } from "./forage";
import { tileDifficulty, useGameState } from "../hooks/useGameState";
import { useState } from "react";
import { TopLevelWrapper } from "./components/TopLvlWrapper";
import { useSound } from "../hooks/useSound";
import { SaveBtn } from "./components/SaveBtn";
import { DifficultySetting } from "./components/DifficultySetting";

const Tile = () => {
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

  const [maxIncorrect, setDifficulty] = useState(tileDifficulty.medium);
  const [roundOver, setRoundOver] = useState(false);
  const getMushroomSet = trpc.mushroomSet.useQuery(
    {
      omitArr,
      numOptions: maxIncorrect,
      user_id: user?.sub ?? null,
    },
    {
      enabled: round !== 0 && round !== 4,
      ...reactQueryConfig,
    }
  );

  const correctMushroom = getMushroomSet.data?.correctMushroom;
  const options = getMushroomSet.data?.options;
  const gameOver = round > 3;
  const { correctSound, incorrectSound, startSound } = useSound();

  const handleSelection = async (name: string) => {
    if (name !== correctMushroom) {
      incorrectSound?.play();
      const trainingDataCopy = trainingResult?.slice() ?? [];
      const newResult: TrainingData = {
        misidentifiedMushroom: correctMushroom ?? null,
        weightingData: { [name]: 5 },
      };
      trainingDataCopy.push(newResult);
      setTrainingResult(trainingDataCopy);

      correctMushroom &&
        setRoundMetaData((prev: RoundMetadata[]) => {
          return prev.concat({
            correct_mushroom: correctMushroom,
            correct_answer: false,
            game_type: "tile",
          });
        });

      setProgress((prev) => {
        return prev.concat(false);
      });
    } else {
      correctSound?.play();
      setRoundOver(true);

      correctMushroom &&
        setRoundMetaData((prev: RoundMetadata[]) => {
          return prev.concat({
            correct_mushroom: correctMushroom,
            correct_answer: true,
            game_type: "tile",
          });
        });

      setProgress((prev) => {
        return prev.concat(true);
      });
    }
  };

  const handleNextBtn = async () => {
    setScore(score + maxIncorrect * 2);
    setProgress((prev) => {
      return prev.concat(true);
    });

    setRound(round + 1);
    setOmitArr((prev) => {
      if (omitArr && correctMushroom) {
        const newOmitArr = [...prev, correctMushroom];
        return newOmitArr;
      }
      return prev;
    });

    setRoundOver(false);
    setProgress([]);
  };

  return (
    <TopLevelWrapper backgroundColor="#091122">
      <Flex
        gap={5}
        direction="column"
        alignItems="center"
        paddingBottom="200px"
      >
        <HomeBtn w="-moz-fit-content" mt={3} />
        <Heading color="white" fontFamily={"honeyMushroom"}>
          {" "}
          Tile Game
        </Heading>
        <Flex gap={2} direction={"column"} alignItems="center">
          <ProgressIndicator round={round} score={score} progress={progress} />
          {round < 1 && (
            <Flex direction="column" gap="10">
              <Image
                src="/tile.png"
                height={200}
                width={200}
                blurDataURL={"/tile.png"}
                alt="tile game"
                className={"pulse"}
                priority
              ></Image>

              <DifficultySetting
                setDifficulty={setDifficulty}
                difficultyNum={maxIncorrect}
                difficultyType={tileDifficulty}
              />

              <Button
                onClick={() => {
                  setRound(round + 1);
                  startSound?.play();
                }}
              >
                Start
              </Button>
            </Flex>
          )}

          <Button
            onClick={handleNextBtn}
            width="fit-content"
            visibility={roundOver ? "visible" : "hidden"}
          >
            Next
          </Button>

          {round > 0 && !getMushroomSet.isRefetching && (
            <Flex gap={2} flexDirection="column" alignItems="center">
              {getMushroomSet.isLoading && !gameOver && (
                <Spinner color="white" />
              )}

              <SimpleGrid columns={1} gap={1} width="fit-content">
                {getMushroomSet.data?.mushroomImgSrcs
                  .map((src) => {
                    return (
                      <Image
                        key={src}
                        src={src}
                        alt="testMushroom"
                        height={350}
                        width={350}
                        priority
                      />
                    );
                  })
                  .filter((_, index) => index === 0)}
              </SimpleGrid>

              <Flex direction={"column"} gap={1}>
                <SaveBtn
                  gameOver={gameOver}
                  score={score}
                  trainingResult={trainingResult}
                  roundMetaData={roundMetaData}
                />
                <SimpleGrid
                  columns={{ base: 2, md: 3 }}
                  gap={{ base: 0.5, md: 1 }}
                  height="fit-content"
                >
                  {round > 0 &&
                    options?.map((name) => (
                      <Button
                        size={{ base: "xs", md: "sm", lg: "md" }}
                        disabled={roundOver}
                        key={name}
                        onClick={() => handleSelection(name)}
                      >
                        {name}
                      </Button>
                    ))}
                </SimpleGrid>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    </TopLevelWrapper>
  );
};

export default Tile;
