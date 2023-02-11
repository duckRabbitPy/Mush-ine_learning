import {
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
} from "@chakra-ui/react";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import { RoundMetadata, TrainingData } from "../utils/serverSideUtils";
import { ProgressIndicator } from "./components/Progress";
import { reactQueryConfig } from "./forage";
import { tileDifficulty, useGameState } from "../hooks/useGameState";
import { useState } from "react";
import { TopLevelWrapper } from "./components/TopLvlWrapper";
import { useSound } from "../hooks/useSound";
import { SaveBtn } from "./components/SaveBtn";
import { DifficultySetting } from "./components/DifficultySetting";
import { brandColors } from "./_app";

const Tile = () => {
  const {
    trainingData,
    setTrainingData,
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
  } = useGameState();

  const [maxIncorrect, setMaxIncorrect] = useState<number>(
    tileDifficulty.medium
  );
  const [roundOver, setRoundOver] = useState(false);
  const gameOver = round > 5;
  const getMushroomSet = trpc.retrieveMushroomSet.useQuery(
    {
      omitArr,
      numOptions: maxIncorrect,
    },
    {
      enabled: round !== 0 && !gameOver,
      ...reactQueryConfig,
    }
  );

  const correctMushroom = getMushroomSet.data?.correctMushroom;
  const src = getMushroomSet.data?.mushroomImgSrcs[0];
  const options = getMushroomSet.data?.options;

  const { correctSound, incorrectSound, startSound } = useSound();

  const handleSelection = async (name: string) => {
    if (name !== correctMushroom) {
      incorrectSound?.play();

      if (correctMushroom) {
        const newResult: TrainingData = {
          misidentifiedMushroom: correctMushroom,
          weightingData: { [name]: 5 },
        };
        const trainingDataCopy = trainingData?.slice() ?? [];
        trainingDataCopy.push(newResult);
        setTrainingData(trainingDataCopy);
      }

      setRoundMetaData((prev: RoundMetadata[]) => {
        if (!correctMushroom) return prev;
        return prev.concat({
          correct_mushroom: correctMushroom,
          correct_answer: false,
          game_type: "tile",
        });
      });
      setProgress((prev) => prev.concat(false));
    } else {
      correctSound?.play();
      setRoundOver(true);

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
    setProgress((prev) => prev.concat(true));

    setRound(round + 1);
    setOmitArr((prev) => {
      return correctMushroom ? [...prev, correctMushroom] : prev;
    });

    setRoundOver(false);
    setProgress([]);
  };

  return (
    <TopLevelWrapper backgroundColor={brandColors.blackBlue}>
      <Flex gap={5} direction="column" alignItems="center">
        <HomeBtn w="-moz-fit-content" mt={3} />
        <Heading
          color="white"
          fontFamily={"honeyMushroom"}
          letterSpacing="widest"
        >
          Tile Game
        </Heading>
        <Flex gap={2} direction={"column"} alignItems="center">
          {!gameOver && (
            <ProgressIndicator
              round={round}
              score={score}
              progress={progress}
            />
          )}
          {round < 1 && (
            <Flex direction="column" gap="10" minHeight={200}>
              <Image
                src="/tile.png"
                height={350}
                width={350}
                blurDataURL={"/tile.png"}
                alt="tile game"
                className={"pulse"}
                priority
              />

              <DifficultySetting
                setMaxIncorrect={setMaxIncorrect}
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
            mt={5}
          >
            Next
          </Button>

          {round > 0 && !getMushroomSet.isRefetching && (
            <Flex gap={2} flexDirection="column" alignItems="center">
              {getMushroomSet.isLoading && !gameOver && (
                <Spinner color="white" />
              )}

              {!gameOver && round !== 0 && !getMushroomSet.isLoading && (
                <>
                  <Heading
                    color="white"
                    fontSize={"sm"}
                    fontFamily="rounded"
                    m={5}
                  >
                    What mushroom is this?
                  </Heading>

                  <HStack>
                    {src ? (
                      <Image
                        key={src}
                        src={src}
                        alt="testMushroom"
                        height={250}
                        width={250}
                        priority
                      />
                    ) : (
                      <Container height={350} />
                    )}
                  </HStack>
                </>
              )}

              <Flex direction={"column"} gap={1}>
                {gameOver && (
                  <SaveBtn
                    gameOver={gameOver}
                    score={score}
                    trainingData={trainingData}
                    roundMetaData={roundMetaData}
                  />
                )}
                <SimpleGrid
                  columns={{ base: 2, md: 3 }}
                  gap={{ base: 0.5, md: 1 }}
                  height="fit-content"
                  marginBottom="50px"
                >
                  {round > 0 &&
                    options?.map((name) => (
                      <Button
                        size={{ base: "xs", md: "sm", lg: "md" }}
                        isDisabled={roundOver}
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
