import { useUser } from "@auth0/nextjs-auth0";
import { Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";

const Profile = () => {
  const { user } = useUser();
  const xpQuery = trpc.retrieveUserScore.useQuery({ user_id: user?.sub ?? "" });
  const snapshot = trpc.downloadLevelSnapShot.useQuery({
    level: 1,
    user_id: user?.sub ?? "",
  });
  console.log(snapshot.data);
  return (
    <>
      <Flex direction="column" alignItems={"center"} mt={10}>
        <Heading mb={10}>Profile - {user?.name}</Heading>
        <HomeBtn />
        {xpQuery.isLoading ? (
          <Spinner />
        ) : (
          <Text mt={5} fontSize="3xl">
            XP: {xpQuery.data ?? 0}
          </Text>
        )}
      </Flex>
    </>
  );
};

export default Profile;
