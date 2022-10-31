import { Button, Flex, SimpleGrid, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import { TrainingData } from "../utils/server";
import { useUser } from "@auth0/nextjs-auth0";
import { ProgressIndicator } from "./components/Progress";
import { reactQueryConfig } from "./forage";

const Tile = () => {
  const [round, setRound] = useState(0);
  const [omitArr, setOmitArr] = useState<string[]>([]);
  const [trainingResult, setTrainingResult] = useState<TrainingData[] | []>([]);
  const [progress, setProgress] = useState<boolean[]>([]);
  const saveScore = trpc.storeUserScore.useMutation();
  const saveTrainingData = trpc.storeTrainingData.useMutation();
  const [score, setScore] = useState(0);
  const { user } = useUser();
  const getMushroomSet = trpc.mushroomSet.useQuery(
    {
      omitArr,
      numOptions: 9,
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
      saveScore.mutate({ user_id, score });
      saveTrainingData.mutate({ trainingData: trainingResult, user_id });
    } else {
      throw new Error("user object lacking sub property");
    }
  };

  return (
    <Flex gap={5} direction="column" alignItems="center">
      <HomeBtn w="-moz-fit-content" mt={3} />
      Multi Quiz
      <Flex gap={2} direction={"column"}>
        {round < 1 && (
          <Button onClick={() => setRound(round + 1)}>Start</Button>
        )}
        {round > 0 && (
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
                >
                  Save score
                </Button>
              )}
              {round > 0 &&
                options?.map((name) => (
                  <Button key={name} onClick={() => handleSelection(name)}>
                    {name}
                  </Button>
                ))}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default Tile;
