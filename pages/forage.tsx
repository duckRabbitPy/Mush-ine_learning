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
import { useState } from "react";
import { TestMushroom } from "../utils/server";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";

const Forage = () => {
  const [testMushrooms, setTestMushrooms] = useState<TestMushroom[] | []>([]);
  const [omitArr, setOmitArr] = useState<string[]>([]);
  const [inputAnswer, setInputAnswer] = useState<string | null>(null);
  const correctMushroom = testMushrooms?.filter((t) => t.correctMatch)[0];
  const gameOver = testMushrooms.length < 1 && omitArr.length > 0;

  const getTestMushrooms = trpc.testMushrooms.useQuery({
    omitArr,
    max: 4,
  });

  const handleNextBtn = async () => {
    const newTestMushrooms = getTestMushrooms.data;
    if (newTestMushrooms) {
      setTestMushrooms(newTestMushrooms);
      setOmitArr((arr) => {
        if (inputAnswer === correctMushroom?.name) {
          arr.push(correctMushroom.name);
        }
        return arr;
      });
      setInputAnswer(null);
    }
  };

  return (
    <Flex gap={5} direction="column" alignItems="center">
      <HomeBtn w="-moz-fit-content" mt={3} />
      <Flex direction="column" gap={5}>
        <Heading size={"md"} mb={2} pl={2} pr={2}>
          {correctMushroom?.name
            ? `Find 🔎 the ${correctMushroom?.name} mushroom`
            : "Forage Game🍄"}

          {inputAnswer === correctMushroom?.name && "✅"}
          {inputAnswer && inputAnswer !== correctMushroom?.name && "❌"}
        </Heading>
        <Button onClick={handleNextBtn} w="-moz-fit-content" alignSelf="center">
          {!correctMushroom ? "Start" : "Next"}
        </Button>
      </Flex>
      <Container>
        {getTestMushrooms.isLoading ? (
          <Spinner />
        ) : (
          <SimpleGrid columns={2} gap={2}>
            {testMushrooms?.map((testMushroom) => {
              return (
                <Container
                  key={testMushroom.name}
                  p={0}
                  display="flex"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <Image
                    onClick={() => {
                      setInputAnswer(testMushroom.name);
                    }}
                    src={testMushroom.src}
                    alt="testMushroom"
                    height={250}
                    width={250}
                    style={{
                      borderRadius: "5px",
                      opacity:
                        inputAnswer && !testMushroom.correctMatch ? "0.5" : 1,
                    }}
                  />
                  <Text fontSize="small">
                    {inputAnswer ? testMushroom.name : ""}
                  </Text>
                </Container>
              );
            })}
            {gameOver && <Text>Game over!</Text>}
          </SimpleGrid>
        )}
      </Container>
    </Flex>
  );
};

export default Forage;
