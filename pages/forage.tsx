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
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";
import { useUser } from "@auth0/nextjs-auth0";

const Forage = () => {
  const [round, setRound] = useState(0);
  const [omitArr, setOmitArr] = useState<string[]>([]);
  const [inputAnswer, setInputAnswer] = useState<string | null>(null);

  const [score, setScore] = useState(0);
  const { user } = useUser();

  console.log(user?.sub);
  const getTestMushrooms = trpc.testMushrooms.useQuery(
    {
      omitArr,
      max: 4,
    },
    { enabled: round !== 0 && round !== 4 }
  );
  const saveScore = trpc.storeUserScore.useMutation();
  const testMushrooms = getTestMushrooms.data;
  const correctMushroom = testMushrooms?.filter((t) => t.correctMatch)[0];
  const gameOver =
    (testMushrooms && testMushrooms?.length < 1 && omitArr.length > 0) ||
    round > 3;

  const handleNextBtn = async () => {
    const answerCorrect = inputAnswer === correctMushroom?.name;
    if (answerCorrect) {
      setScore(score + 10);
    }
    setOmitArr(() => {
      if (omitArr && correctMushroom?.name) {
        omitArr.push(correctMushroom.name);
      }
      return omitArr;
    });

    setInputAnswer(null);
    setRound(round + 1);
  };

  const handleSaveBtn = async () => {
    const userId = user?.sub;
    if (userId) {
      saveScore.mutate({ userId, score });
    } else {
      throw new Error("user object lacking sub property");
    }
  };

  return (
    <Flex gap={5} direction="column" alignItems="center">
      <HomeBtn w="-moz-fit-content" mt={3} />
      <Flex direction="column" gap={5}>
        {!gameOver && (
          <>
            <Heading size={"md"} mb={2} pl={2} pr={2}>
              {correctMushroom?.name
                ? `Find 🔎 the ${correctMushroom?.name} mushroom`
                : "Forage Game🍄"}
              {inputAnswer === correctMushroom?.name && "✅"}
              {inputAnswer && inputAnswer !== correctMushroom?.name && "❌"}
              <Text pt="2" fontWeight="medium">
                Round: {round}
              </Text>
              <Text pt="2" fontWeight="light">
                Score: {score}
              </Text>
            </Heading>
            <Button
              onClick={handleNextBtn}
              w="-moz-fit-content"
              alignSelf="center"
            >
              {round === 0 ? "Start" : "Next"}
            </Button>
          </>
        )}
        {gameOver && (
          <Button
            onClick={handleSaveBtn}
            w="-moz-fit-content"
            alignSelf="center"
          >
            Save score
          </Button>
        )}
      </Flex>
      <Container>
        {round !== 0 && round !== 4 && getTestMushrooms.isLoading ? (
          <Spinner />
        ) : (
          <SimpleGrid columns={2} gap={2}>
            {!gameOver &&
              getTestMushrooms.data?.map((testMushroom) => {
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
