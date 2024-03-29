import { Button, Flex, SimpleGrid, Spinner, Heading } from "@chakra-ui/react";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import { RoundMetadata, TrainingData } from "../utils/serverSideUtils";
import { ProgressIndicator } from "./components/Progress";
import { reactQueryConfig } from "./forage";
import { baseDifficulty, useGameState } from "../hooks/useGameState";
import { TopLevelWrapper } from "./components/TopLvlWrapper";
import { useSound } from "../hooks/useSound";
import { SaveBtn } from "./components/SaveBtn";
import { DifficultySetting } from "./components/DifficultySetting";
import { brandColors } from "./_app";

const Multi = () => {
  const {
    roundMetaData,
    setRoundMetaData,
    trainingData,
    setTrainingData,
    round,
    setRound,
    omitArr,
    setOmitArr,
    progress,
    setProgress,
    score,
    setScore,
    numImagesLoaded,
    setNumImagesLoaded,
    maxIncorrect,
    setMaxIncorrect,
  } = useGameState();

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
  const options = getMushroomSet.data?.options;

  const { correctSound, incorrectSound, startSound } = useSound();

  const handleSelection = async (name: string) => {
    setNumImagesLoaded(0);
    if (name === correctMushroom) {
      correctSound?.play();
      setScore(score + maxIncorrect * 5);
      setProgress((prev) => {
        return prev.concat(true);
      });
    } else {
      incorrectSound?.play();

      if (correctMushroom) {
        const newResult: TrainingData = {
          misidentifiedMushroom: correctMushroom,
          weightingData: { [name]: 20 },
        };

        const trainingDataCopy = trainingData?.slice() ?? [];
        trainingDataCopy.push(newResult);
        setTrainingData(trainingDataCopy);
      }

      setProgress((prev) => {
        return prev.concat(false);
      });
    }

    setRound(round + 1);

    setRoundMetaData((prev: RoundMetadata[]) => {
      if (!correctMushroom) return prev;
      return prev.concat({
        correct_mushroom: correctMushroom,
        correct_answer: name === correctMushroom,
        game_type: "multi",
      });
    });

    setOmitArr((prev) => {
      return correctMushroom ? [...prev, correctMushroom] : prev;
    });
  };

  const finishedLoadingImages =
    numImagesLoaded >= (getMushroomSet.data?.mushroomImgSrcs.length ?? -1);

  return (
    <TopLevelWrapper backgroundColor={brandColors.blackBlue}>
      <Flex
        gap={5}
        direction="column"
        alignItems="center"
        paddingBottom="200px"
      >
        <HomeBtn w="-moz-fit-content" mt={3} />
        <Heading
          color="white"
          fontSize="3xl"
          fontFamily={"honeyMushroom"}
          letterSpacing="widest"
          mt={3}
        >
          Multi Quiz
        </Heading>

        <ProgressIndicator
          round={gameOver ? undefined : round}
          score={score}
          progress={progress}
        />
        {!gameOver && round !== 0 && !getMushroomSet.isLoading && (
          <Heading color="white" fontSize={"sm"} fontFamily="rounded">
            What mushroom is this?
          </Heading>
        )}

        <Flex gap={2} direction={"column"} margin={5}>
          {round < 1 && (
            <Flex direction="column" gap="10">
              <Image
                src="/multi.png"
                height={200}
                width={200}
                blurDataURL={"/multi.png"}
                alt="multi game"
                priority
                className={"pulse"}
              />

              <DifficultySetting
                setMaxIncorrect={setMaxIncorrect}
                difficultyNum={maxIncorrect}
                difficultyType={baseDifficulty}
              />

              <Button
                onClick={() => {
                  startSound?.play();
                  setRound(round + 1);
                }}
                backgroundColor={brandColors.skyBlue}
              >
                Start
              </Button>
            </Flex>
          )}

          {round > 0 && !getMushroomSet.isRefetching && (
            <Flex gap={2} direction={{ base: "column", md: "row" }}>
              {getMushroomSet.isLoading && !gameOver && (
                <Spinner color="white" />
              )}

              <SimpleGrid columns={3} gap={1}>
                {getMushroomSet.data?.mushroomImgSrcs.map((src) => {
                  return (
                    <Image
                      key={src}
                      src={src}
                      alt="testMushroom"
                      height={150}
                      width={150}
                      onLoadingComplete={() => {
                        setNumImagesLoaded((complete: number) => complete + 1);
                      }}
                      style={{
                        visibility: finishedLoadingImages
                          ? "visible"
                          : "hidden",
                      }}
                      priority
                    />
                  );
                })}
              </SimpleGrid>

              <Flex direction={"column"} gap={1}>
                <SaveBtn
                  gameOver={gameOver}
                  score={score}
                  trainingData={trainingData}
                  roundMetaData={roundMetaData}
                />
                {round > 0 &&
                  options?.map((name) => (
                    <Button
                      key={name}
                      onClick={() => handleSelection(name)}
                      backgroundColor={brandColors.skyBlue}
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
