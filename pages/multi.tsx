import { Button, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { useState } from "react";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import { TrainingData } from "../utils/server";
import { useUser } from "@auth0/nextjs-auth0";

const Multi = () => {
  const [round, setRound] = useState(0);
  const [omitArr, setOmitArr] = useState<string[]>([]);
  const [trainingResult, setTrainingResult] = useState<TrainingData[] | []>([]);
  const saveScore = trpc.storeUserScore.useMutation();
  const saveTrainingData = trpc.storeTrainingData.useMutation();
  const [inputAnswer, setInputAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const { user } = useUser();
  const getMushroomSet = trpc.mushroomSet.useQuery(
    {
      omitArr,
    },
    {
      enabled: round !== 0 && round !== 4,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  const correctMushroom = getMushroomSet.data?.correctMushroom;
  const options = getMushroomSet.data?.options;

  return (
    <Flex gap={5} direction="column" alignItems="center">
      <HomeBtn w="-moz-fit-content" mt={3} />
      Multi Quiz
      <Flex gap={2}>
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
        <Flex gap={2} direction={"column"}>
          {round < 1 ? (
            <Button onClick={() => setRound(round + 1)}>Start</Button>
          ) : (
            <Flex gap={5}>
              <Text>Score: {score}</Text>
              <Text>Round: {round}</Text>
            </Flex>
          )}
          {options?.map((name) => (
            <Button
              key={name}
              onClick={() => {
                if (name === correctMushroom) {
                  setScore(score + 10);
                }

                if (name !== correctMushroom) {
                  const trainingDataCopy = trainingResult?.slice() ?? [];
                  const newResult: TrainingData = {
                    misidentifiedMushroom: name,
                    weightingData: {},
                  };
                  trainingDataCopy.push(newResult);
                  setTrainingResult(trainingDataCopy);
                }

                setRound(round + 1);

                setOmitArr((prev) => {
                  if (omitArr && correctMushroom) {
                    const newOmitArr = [...prev, correctMushroom];
                    return newOmitArr;
                  }
                  return prev;
                });
              }}
            >
              {name}
            </Button>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Multi;
