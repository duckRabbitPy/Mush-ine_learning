import {
  Button,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import {
  ForageMushroom,
  RoundMetadata,
  TrainingData,
} from "../utils/serverSideUtils";
import { ProgressIndicator } from "./components/Progress";
import { baseDifficulty, useGameState } from "../hooks/useGameState";
import { TopLevelWrapper } from "./components/TopLvlWrapper";
import { useSound } from "../hooks/useSound";
import { SaveBtn } from "./components/SaveBtn";
import { DifficultySetting } from "./components/DifficultySetting";
import { brandColors } from "./_app";

export const reactQueryConfig = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

const Forage = () => {
  const {
    trainingData,
    setTrainingData,
    roundMetaData,
    setRoundMetaData,
    round,
    setRound,
    omitArr,
    setOmitArr,
    inputAnswer,
    setInputAnswer,
    progress,
    setProgress,
    score,
    setScore,
    numImagesLoaded,
    setNumImagesLoaded,
    maxIncorrect,
    setMaxIncorrect,
  } = useGameState();

  const getForageMushrooms = trpc.retrieveForageMushrooms.useQuery(
    {
      omitArr,
      maxIncorrect: maxIncorrect,
    },
    {
      enabled: round !== 0 && round !== 6,
      ...reactQueryConfig,
    }
  );

  const forageMushrooms = getForageMushrooms?.data;
  const correctMushroom = forageMushrooms?.filter((t) => t.correctMatch)[0];
  const gameOver =
    (forageMushrooms && forageMushrooms?.length < 1 && omitArr.length > 0) ||
    round > 5;
  const answerCorrect = inputAnswer === correctMushroom?.name;
  const { correctSound, incorrectSound, startSound } = useSound();
  const finishedLoadingImages =
    numImagesLoaded >= (getForageMushrooms?.data?.length ?? -1);

  const handleNextBtn = async () => {
    setNumImagesLoaded(0);
    if (answerCorrect) {
      setScore(score + maxIncorrect * 2);
      setProgress((prev) => prev.concat(true));
    } else {
      setProgress((prev) => prev.concat(false));
    }

    setRoundMetaData((prev: RoundMetadata[]) => {
      if (!correctMushroom) return prev;
      return prev.concat({
        correct_mushroom: correctMushroom.name,
        correct_answer: answerCorrect,
        game_type: "forage",
      });
    });

    setOmitArr((prev) => {
      return correctMushroom?.name ? [...prev, correctMushroom.name] : prev;
    });

    setInputAnswer(null);
    setRound(round + 1);
  };

  function handleSelection(forageMushroom: ForageMushroom) {
    if (
      correctMushroom?.name &&
      correctMushroom.name !== forageMushroom?.name
    ) {
      // Incorrect answer given, update training data
      const newTrainingData: TrainingData = {
        misidentifiedMushroom: correctMushroom.name,
        weightingData: { [forageMushroom.name]: 10 },
      };
      setTrainingData([...trainingData, newTrainingData]);
    }
    if (!inputAnswer) {
      setInputAnswer(forageMushroom.name);
    }

    forageMushroom.correctMatch ? correctSound?.play() : incorrectSound?.play();
  }

  return (
    <TopLevelWrapper backgroundColor={brandColors.blackBlue}>
      <Flex gap={2} direction="column" alignItems="center">
        <HomeBtn w="-moz-fit-content" mt={3} />
        <Flex direction="column" gap={2} mt={2} alignItems="center">
          {!gameOver && !getForageMushrooms.isRefetching && (
            <>
              {
                <Heading
                  mt={2}
                  letterSpacing="widest"
                  fontFamily={"honeyMushroom"}
                  color="white"
                >
                  Forage
                </Heading>
              }

              {!gameOver && (
                <Heading
                  size={"md"}
                  mt={2}
                  mb={2}
                  p={5}
                  color="white"
                  fontFamily="rounded"
                  visibility={correctMushroom?.name ? "visible" : "hidden"}
                >
                  Find 🔎 and click on 👉🏼 the{" "}
                  <span style={{ color: brandColors.lightGreen }}>
                    {correctMushroom?.name}
                  </span>{" "}
                  mushroom
                </Heading>
              )}

              {round > 0 && (
                <ProgressIndicator
                  round={round}
                  score={score}
                  progress={progress}
                />
              )}

              {round === 0 && !getForageMushrooms.data ? (
                <Flex direction="column" gap="10">
                  <Text color="white" p={5}>
                    You will be shown {} images. Identify the target mushroom.
                  </Text>
                  <Image
                    src="/forage.png"
                    height={200}
                    width={200}
                    alt="forage game"
                    blurDataURL={"/forage.png"}
                    className={"pulse"}
                    priority
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
                    w="-moz-fit-content"
                    alignSelf="center"
                  >
                    Start
                  </Button>
                </Flex>
              ) : (
                <>
                  <Button
                    onClick={handleNextBtn}
                    w="-moz-fit-content"
                    alignSelf="center"
                    mb={5}
                    visibility={
                      !getForageMushrooms.isLoading && inputAnswer
                        ? "visible"
                        : "hidden"
                    }
                  >
                    Next
                  </Button>
                </>
              )}
            </>
          )}
          {gameOver && <Text>Game over!</Text>}
        </Flex>
        <Container>
          {round !== 0 && !gameOver && getForageMushrooms.isLoading ? (
            <Spinner color="white" />
          ) : (
            <SimpleGrid columns={maxIncorrect > 3 ? 3 : 2} gap={2}>
              {!gameOver &&
                getForageMushrooms.data?.map((forageMushroom, index) => {
                  return (
                    <Container
                      key={`${forageMushroom.name}${index}`}
                      p={0}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Image
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSelection(forageMushroom);
                          }
                        }}
                        onClick={() => {
                          handleSelection(forageMushroom);
                        }}
                        onLoadingComplete={() => {
                          setNumImagesLoaded(
                            (complete: number) => complete + 1
                          );
                        }}
                        src={forageMushroom.src}
                        alt="forageMushroom"
                        height={200}
                        width={200}
                        style={{
                          cursor: "pointer",
                          borderRadius: "5px",
                          visibility: finishedLoadingImages
                            ? "visible"
                            : "hidden",
                          opacity:
                            inputAnswer && !forageMushroom.correctMatch
                              ? "0.6"
                              : 1,
                          border:
                            inputAnswer && forageMushroom.correctMatch
                              ? `2px solid ${brandColors.lightGreen}`
                              : undefined,
                        }}
                        priority
                      />

                      <Text
                        fontSize="medium"
                        color={
                          forageMushroom.correctMatch
                            ? brandColors.green
                            : brandColors.red
                        }
                        height={10}
                      >
                        {inputAnswer ? forageMushroom.name : ""}
                      </Text>
                    </Container>
                  );
                })}
            </SimpleGrid>
          )}
        </Container>
        <SaveBtn
          gameOver={gameOver}
          score={score}
          trainingData={trainingData}
          roundMetaData={roundMetaData}
        />
      </Flex>
    </TopLevelWrapper>
  );
};

export default Forage;
