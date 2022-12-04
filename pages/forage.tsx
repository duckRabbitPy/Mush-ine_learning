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
import { extractTrainingData, returnLvl } from "../utils/client_safe";
import { ProgressIndicator } from "./components/Progress";
import { useCommonTrpc } from "../hooks/useCommonTrpc";
import { useGameState } from "../hooks/useGameState";
import { TopLevelWrapper } from "./components/TopLvlWrapper";
import { useSound } from "../hooks/useSound";

export const reactQueryConfig = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

const Forage = () => {
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
    inputAnswer,
    setInputAnswer,
    progress,
    setProgress,
    score,
    setScore,
    user,
  } = useGameState();

  const getForageMushrooms = trpc.forageMushrooms.useQuery(
    {
      omitArr,
      maxIncorrect: 3,
      user_id: user?.sub ?? null,
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
      setScore(score + 10);
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
      <Flex gap={2} direction="column" alignItems="center">
        <HomeBtn w="-moz-fit-content" mt={3} />
        <Flex direction="column" gap={2} alignItems="center">
          {!gameOver && !getForageMushrooms.isRefetching && (
            <>
              <Heading
                size={"md"}
                mt={2}
                mb={2}
                pl={2}
                pr={2}
                color="white"
                fontFamily="rounded"
              >
                {correctMushroom?.name
                  ? `Find 🔎 and click 👉🏼 on the ${correctMushroom?.name} mushroom`
                  : "Forage Game 🍄"}
              </Heading>
              <ProgressIndicator
                round={round}
                score={score}
                progress={progress}
              />

              {round === 0 && !correctMushroom ? (
                <Flex direction="column" gap="10">
                  <Image
                    src="/forage.png"
                    height={200}
                    width={200}
                    alt="forage game"
                    blurDataURL={"/forage.png"}
                    className={"pulse"}
                    priority
                  ></Image>
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
          {gameOver && !saveScore.isSuccess && (
            <Button
              onClick={handleSaveBtn}
              w="-moz-fit-content"
              alignSelf="center"
              backgroundColor={saveScore?.isLoading ? "green.300" : ""}
            >
              Save score
            </Button>
          )}
          {gameOver && saveScore.isSuccess && (
            <Text color="white">Score saved! Return to home </Text>
          )}
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
                      >
                        {inputAnswer ? testMushroom.name : ""}
                      </Text>
                    </Container>
                  );
                })}
            </SimpleGrid>
          )}
        </Container>
      </Flex>
    </TopLevelWrapper>
  );
};

export default Forage;
