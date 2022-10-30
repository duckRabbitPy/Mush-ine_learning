import { Button, Flex, SimpleGrid } from "@chakra-ui/react";
import { useState } from "react";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";

const Multi = () => {
  const [round, setRound] = useState(0);
  const [omitArr, setOmitArr] = useState<string[]>([]);
  const getMushroomSet = trpc.mushroomSet.useQuery(
    {
      omitArr,
    },
    { enabled: round !== 0 && round !== 4, refetchOnMount: false }
  );

  const correctMushroom = getMushroomSet.data?.correctMushroom;
  const options = getMushroomSet.data?.options;

  return (
    <Flex gap={5} direction="column" alignItems="center">
      <HomeBtn w="-moz-fit-content" mt={3} />
      Multi Quiz
      <Flex gap={2}>
        {round < 1 && (
          <Button
            onClick={() => {
              setRound(round + 1);
            }}
          >
            Start
          </Button>
        )}
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
          {options?.map((name) => (
            <Button
              key={name}
              onClick={() => {
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
