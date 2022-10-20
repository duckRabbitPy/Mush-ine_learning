import { Button, Container, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import Image from "next/image";
import HomeBtn from "./components/HomeBtn";
import { useState } from "react";
import { trpc } from "../utils/trpc";

const Forage = () => {
  const testMushrooms = trpc.testMushrooms.useQuery({
    omitArr: [],
    number: 5,
  }).data;

  const [inputAnswer, setInputAnswer] = useState<string | null>(null);
  const correctMushroom = testMushrooms?.filter((t) => t.correctMatch)[0];
  return (
    <Container>
      <HomeBtn />
      <Heading size={"md"} mb={2}>
        Find the: {correctMushroom?.name} mushroom{" "}
        {inputAnswer === correctMushroom?.name && "✅"}
        {inputAnswer && inputAnswer !== correctMushroom?.name && "❌"}
      </Heading>
      <Button onClick={() => {}}>Start</Button>
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
    </Container>
  );
};

export default Forage;
