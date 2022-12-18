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
import { RoundMetadata } from "../utils/server_side";
import { extractTrainingData } from "../utils/client_safe";
import { ProgressIndicator } from "./components/Progress";
import { baseDifficulty, useGameState } from "../hooks/useGameState";
import { TopLevelWrapper } from "./components/TopLvlWrapper";
import { useSound } from "../hooks/useSound";
import { SaveBtn } from "./components/SaveBtn";
import { DifficultySetting } from "./components/DifficultySetting";

export const reactQueryConfig = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

const Forage = () => {
  const {
    trainingResult,
    setTrainingResult,
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
    maxIncorrect,
    setMaxIncorrect,
  } = useGameState();

  const getForageMushrooms = trpc.retrieveForageMushrooms.useQuery(
    {
      omitArr,
      maxIncorrect: maxIncorrect,
    },
    {
      enabled: round !== 0 && round !== 4,
      ...reactQueryConfig,
    }
  );

  const forageMushrooms = getForageMushrooms?.data;
  const correctMushroom = forageMushrooms?.filter((t) => t.correctMatch)[0];
  const gameOver =
    (forageMushrooms && forageMushrooms?.length < 1 && omitArr.length > 0) ||
    round > 3;
  const answerCorrect = inputAnswer === correctMushroom?.name;
  const { correctSound, incorrectSound, startSound } = useSound();

  const handleNextBtn = async () => {
    if (answerCorrect) {
      setScore(score + maxIncorrect * 2);
      setProgress((prev) => {
        return prev.concat(true);
      });
    } else if (!answerCorrect) {
      const trainingData = forageMushrooms
        ? extractTrainingData(forageMushrooms, trainingResult)
        : [];

      setTrainingResult(trainingData);
      setProgress((prev) => {
        return prev.concat(false);
      });
    }

    correctMushroom &&
      setRoundMetaData((prev: RoundMetadata[]) => {
        return prev.concat({
          correct_mushroom: correctMushroom.name,
          correct_answer: answerCorrect,
          game_type: "forage",
        });
      });

    setOmitArr((prev) => {
      if (omitArr && correctMushroom?.name) {
        const newOmitArr = [...prev, correctMushroom.name];
        return newOmitArr;
      }
      return prev;
    });

    setInputAnswer(null);
    setRound(round + 1);
  };

  return (
    <TopLevelWrapper backgroundColor="#091122">
      <Flex
        gap={2}
        direction="column"
        alignItems="center"
        paddingBottom="200px"
      >
        <HomeBtn w="-moz-fit-content" mt={3} />
        <Flex direction="column" gap={2} alignItems="center">
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
              {correctMushroom?.name && (
                <Heading
                  size={"md"}
                  mt={2}
                  mb={2}
                  pl={2}
                  pr={2}
                  color="white"
                  fontFamily="rounded"
                >
                  Find 🔎 and click on 👉🏼 the{" "}
                  <span style={{ color: "greenyellow" }}>
                    {correctMushroom?.name}
                  </span>{" "}
                  mushroom
                </Heading>
              )}

              <ProgressIndicator
                round={round}
                score={score}
                progress={progress}
              />

              {round === 0 && !correctMushroom ? (
                <Flex direction="column" gap="10">
                  <Text color="white">
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
                  ></Image>

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
          {round !== 0 && round !== 4 && getForageMushrooms.isLoading ? (
            <Spinner color="white" />
          ) : (
            <SimpleGrid columns={2} gap={2}>
              {!gameOver &&
                getForageMushrooms.data?.map((testMushroom, index) => {
                  return (
                    <Container
                      key={`${testMushroom.name}${index}`}
                      p={0}
                      display="flex"
                      justifyContent="center"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Image
                        onClick={() => {
                          if (!inputAnswer) {
                            setInputAnswer(testMushroom.name);
                          }
                          testMushroom.correctMatch
                            ? correctSound?.play()
                            : incorrectSound?.play();
                        }}
                        src={testMushroom.src}
                        alt="testMushroom"
                        height={250}
                        width={250}
                        style={{
                          cursor: "pointer",
                          borderRadius: "5px",
                          opacity:
                            inputAnswer && !testMushroom.correctMatch
                              ? "0.6"
                              : 1,
                        }}
                      />
                      <Text
                        fontSize="medium"
                        color={
                          testMushroom.correctMatch ? "green.300" : "white"
                        }
                        height={10}
                      >
                        {inputAnswer ? testMushroom.name : ""}
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
          trainingResult={trainingResult}
          roundMetaData={roundMetaData}
        />
      </Flex>
    </TopLevelWrapper>
  );
};

export default Forage;
