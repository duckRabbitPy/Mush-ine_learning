import { useUser } from "@auth0/nextjs-auth0";
import {
  Container,
  Flex,
  Heading,
  Progress,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";

import {
  Chart,
  PointElement,
  CategoryScale,
  BarElement,
  LineElement,
  LinearScale,
} from "chart.js";

import { currLevelInfo } from "../utils/pureFunctions";
import { trpc } from "../utils/trpc";
import BarChart from "./components/BarChart";
import HomeBtn from "./components/HomeBtn";
import TopLevelWrapper from "./components/TopLvlWrapper";
import { brandColors } from "./_app";

Chart.register(
  BarElement,
  PointElement,
  LineElement,
  LinearScale,
  CategoryScale
);

const Profile = () => {
  const { user } = useUser();
  const xpQuery = trpc.retrieveUserXP.useQuery();

  const snapshot = trpc.retrieveLevelSnapShot.useQuery();

  const metaArr = trpc.retrieveRoundMetadata.useQuery().data;

  const { xpToNextLevel, boundaryAhead, boundaryBehind } = currLevelInfo(
    xpQuery.data,
    snapshot.data?.level
  );
  const activity = trpc.retrieveActivity.useQuery().data;

  const xpEarnedThisLevel = boundaryAhead - boundaryBehind - xpToNextLevel;
  const percentageProgress = (xpEarnedThisLevel / xpToNextLevel) * 100;

  return (
    <TopLevelWrapper backgroundColor={brandColors.lightGrey}>
      <Flex direction="column" alignItems={"center"}>
        <Heading mb={10} mt={5} fontFamily={"honeyMushroom"}>
          Profile {user?.name && `- ${user?.name}`}
        </Heading>
        <HomeBtn />

        {xpQuery.isLoading || snapshot.isLoading ? (
          <Spinner color="white" />
        ) : (
          <>
            <Text
              mt={5}
              fontSize="2xl"
              fontWeight={"extrabold"}
              fontFamily={"rounded"}
            >
              Level {snapshot.data?.level}
            </Text>
            <Text
              color={brandColors.green}
              mt={5}
              fontSize="2xl"
              fontFamily="rounded"
            >
              XP: {xpQuery.data ?? 0}
            </Text>

            <Text color="blue.600" fontFamily="rounded">
              xp to next level: {xpToNextLevel}
            </Text>
            <Progress
              m={3}
              hasStripe
              value={percentageProgress > 0 ? percentageProgress : 0.5}
              height={5}
              border="1px gray solid"
              width="80%"
            />

            <Heading fontSize="large" mb={2} mt={5} fontFamily="rounded">
              Stats for level {snapshot.data?.level}
            </Heading>
            <SimpleGrid columns={3} m={5}>
              {Object.entries(metaArr ?? {}).map(([name, data]) => {
                return (
                  <Container key={name} fontFamily="rounded">
                    <Heading
                      fontSize="3xl"
                      style={{ textTransform: "capitalize" }}
                      fontFamily={"honeyMushroom"}
                      fontWeight="thin"
                    >
                      {name}
                    </Heading>
                    <Text color="blue.500" fontFamily="rounded" fontSize={"xl"}>
                      {data?.percentageCorrect?.toFixed(0) ?? 0}% Correct
                    </Text>
                    <Text>
                      {" "}
                      <span style={{ color: brandColors.green }}>
                        {data?.correct ?? 0}
                      </span>{" "}
                      correct ids
                    </Text>
                    <Text>
                      <span style={{ color: brandColors.red }}>
                        {data?.incorrect ?? 0}
                      </span>{" "}
                      incorrect ids
                    </Text>
                  </Container>
                );
              })}
            </SimpleGrid>
          </>
        )}
      </Flex>
      <Container maxWidth={"40%"}>
        {activity && <BarChart kvp={activity} yAxisTitle="rounds completed" />}
      </Container>
    </TopLevelWrapper>
  );
};

export default Profile;
