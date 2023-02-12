import { useUser } from "@auth0/nextjs-auth0";
import {
  Card,
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
    xpQuery.data
  );
  const activity = trpc.retrieveActivity.useQuery().data;

  const xpEarnedThisLevel = boundaryAhead - boundaryBehind - xpToNextLevel;
  const percentageProgress = (xpEarnedThisLevel / xpToNextLevel) * 100;

  return (
    <TopLevelWrapper backgroundColor={brandColors.lightGrey}>
      <Flex direction="column" alignItems={"center"} gap={5}>
        <Heading mb={10} mt={5} fontFamily={"honeyMushroom"}>
          Profile {user?.name && `- ${user?.name}`}
        </Heading>
        <HomeBtn />

        {xpQuery.isLoading || snapshot.isLoading ? (
          <Spinner color={brandColors.blueGrey} margin="1rem" />
        ) : (
          <Container width="80%">
            <Card variant={"elevated"} p={5} width="100%" mb={5}>
              <Text
                mt={5}
                fontSize="2xl"
                fontWeight={"extrabold"}
                fontFamily={"rounded"}
              >
                Level {snapshot.data?.level ?? 0}
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
            </Card>

            {metaArr && (
              <Card p={5} width="100%">
                <Heading fontSize="large" mb={2} mt={5} fontFamily="rounded">
                  Stats for level {snapshot.data?.level ?? 0}
                </Heading>
                <SimpleGrid
                  columns={{ base: 1, md: 3 }}
                  m={{ base: 0, md: 5 }}
                  gap={5}
                  p={2}
                >
                  {Object.entries(metaArr).map(([name, data]) => {
                    return (
                      <Card
                        key={name}
                        fontFamily="rounded"
                        variant={"outline"}
                        p={2}
                      >
                        <Heading
                          fontSize={{ base: "medium", md: "2xl" }}
                          style={{ textTransform: "capitalize" }}
                          fontFamily={"honeyMushroom"}
                          fontWeight="thin"
                        >
                          {name}
                        </Heading>
                        <Text
                          color="blue.500"
                          fontFamily="rounded"
                          fontSize={{ base: "medium", md: "xl" }}
                        >
                          {data?.percentageCorrect?.toFixed(0) ?? 0}% Correct
                        </Text>
                        <Text fontSize={{ base: "small", md: "l" }}>
                          {" "}
                          <span style={{ color: brandColors.green }}>
                            {data?.correct ?? 0}
                          </span>{" "}
                          correct ids
                        </Text>
                        <Text fontSize={{ base: "small", md: "l" }}>
                          <span style={{ color: brandColors.red }}>
                            {data?.incorrect ?? 0}
                          </span>{" "}
                          incorrect ids
                        </Text>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              </Card>
            )}
          </Container>
        )}
        {activity && (
          <Card p={5} mb={10} width="60%">
            <Heading fontSize="large" mb={5} mt={5} fontFamily="rounded">
              Rounds complete level {snapshot.data?.level ?? 0}
            </Heading>
            <Container
              display={"flex"}
              flexDirection="column"
              alignItems="center"
            >
              <BarChart kvp={activity} showYticks />
            </Container>
          </Card>
        )}
      </Flex>
    </TopLevelWrapper>
  );
};

export default Profile;
