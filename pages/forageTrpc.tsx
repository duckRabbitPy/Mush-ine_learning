import {
  Button,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Spinner,
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

  const getTestMushrooms = trpc.testMushrooms.useQuery({
    omitArr,
    number: 5,
  });

  const handleNextBtn = async () => {
    const newTestMushrooms = getTestMushrooms.data;
    if (newTestMushrooms) {
      setTestMushrooms(newTestMushrooms);
      setOmitArr((arr) => {
        if (correctMushroom) {
          arr.push(correctMushroom.name);
        }
        return arr;
      });
      setInputAnswer(null);
    }
  };

  return (
    <Container>
      <HomeBtn />
      <Heading size={"md"} mb={2}>
        Find the: {correctMushroom?.name} mushroom{" "}
        {inputAnswer === correctMushroom?.name && "✅"}
        {inputAnswer && inputAnswer !== correctMushroom?.name && "❌"}
      </Heading>
      <Button onClick={handleNextBtn}>Next</Button>
      {getTestMushrooms.isLoading ? (
        <Spinner />
      ) : (
        <SimpleGrid columns={2} gap={2}>
          {testMushrooms?.map((testMushroom) => {
            return (
              <Container key={testMushroom.name}>
                <Image
                  onClick={() => {
                    setInputAnswer(testMushroom.name);
                  }}
                  src={testMushroom.src}
                  alt="testMushroom"
                  height={200}
                  width={200}
                  style={{
                    opacity:
                      inputAnswer && !testMushroom.correctMatch ? "0.5" : 1,
                  }}
                />
                <Text>{inputAnswer ? testMushroom.name : ""}</Text>
              </Container>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default Forage;
