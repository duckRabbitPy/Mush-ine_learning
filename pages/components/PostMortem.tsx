import { Container, Heading, SimpleGrid } from "@chakra-ui/react";

import { TrainingData } from "../../utils/serverSideUtils";
import Image from "next/image";
import CustomBtn from "./CustomBtn";
import { trpc } from "../../utils/trpc";
import { brandColors } from "../_app";

export type PostMortemProps = {
  trainingData: TrainingData[];
};

export const PostMortem = ({ trainingData }: PostMortemProps) => {
  const uniqueMisidentified = trainingData.reduce<string[]>((acc, curr) => {
    const name = curr.misidentifiedMushroom;
    if (!name || acc.includes(name)) return acc;
    return acc.concat(name);
  }, []);

  const thumbnails =
    trpc.retrieveMushroomImgSrcs.useQuery(uniqueMisidentified).data;

  return (
    <Container display="flex" alignItems={"center"} flexDirection="column">
      {uniqueMisidentified.length > 0 && (
        <Heading size="medium" color={brandColors.red} mb={5} mt={5}>
          Mushrooms misidentified
        </Heading>
      )}
      <SimpleGrid columns={2} gap={2}>
        {uniqueMisidentified.map((misidentifiedMushroom) => (
          <Container key={misidentifiedMushroom} color={brandColors.red}>
            {misidentifiedMushroom}
            <div>
              {thumbnails && thumbnails[misidentifiedMushroom] && (
                <Image
                  src={thumbnails[misidentifiedMushroom]}
                  alt={misidentifiedMushroom}
                  height={100}
                  width={200}
                  priority
                />
              )}
              <CustomBtn
                brandColor={brandColors.blueGrey}
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
