import { Container, Heading, SimpleGrid } from "@chakra-ui/react";

import { TrainingData } from "../../utils/serverSideFunctions";
import Image from "next/image";
import CustomBtn from "./CustomBtn";
import { trpc } from "../../utils/trpc";

export type PostMortemProps = {
  trainingResult: TrainingData[];
};

export const PostMortem = ({ trainingResult }: PostMortemProps) => {
  const uniqueMisidentified = [...new Set(trainingResult)].flatMap((f) =>
    f.misidentifiedMushroom ? [f.misidentifiedMushroom] : []
  );

  const thumbnails =
    trpc.retrieveMushroomImgSrcs.useQuery(uniqueMisidentified).data;

  return (
    <Container display="flex" alignItems={"center"} flexDirection="column">
      <Heading size="medium" color="red" mb={10}>
        Mushrooms misidentified
      </Heading>
      <SimpleGrid columns={2} gap={2}>
        {uniqueMisidentified.map((misidentifiedMushroom) => (
          <Container key={misidentifiedMushroom} color="red">
            {misidentifiedMushroom}
            <div>
              {thumbnails && thumbnails[misidentifiedMushroom] && (
                <Image
                  src={thumbnails[misidentifiedMushroom]}
                  alt={misidentifiedMushroom}
                  height={100}
                  width={200}
                ></Image>
              )}
              <CustomBtn
                brandColor={300}
                href={`/bank/${misidentifiedMushroom}`}
                styles={{ size: "xs" }}
              >
                Study
              </CustomBtn>
            </div>
          </Container>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default PostMortem;
