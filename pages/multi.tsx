import { Flex, SimpleGrid } from "@chakra-ui/react";
import { useState } from "react";
import Image from "next/image";
import { trpc } from "../utils/trpc";

import HomeBtn from "./components/HomeBtn";

const Multi = () => {
  const [round, setRound] = useState(0);
  const [omitArr, setOmitArr] = useState<string[]>([]);
  const getMushroomSet = trpc.mushroomSet.useQuery({
    omitArr,
  });

  const testImages = getMushroomSet.data?.correctMushroom;

  return (
    <Flex gap={5} direction="column" alignItems="center">
      <HomeBtn w="-moz-fit-content" mt={3} />
      Multi Quiz
      <SimpleGrid columns={3} gap={2}>
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
    </Flex>
  );
};

export default Multi;
