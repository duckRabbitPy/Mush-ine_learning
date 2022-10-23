import { useUser } from "@auth0/nextjs-auth0";
import { Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import HomeBtn from "./components/HomeBtn";

const Profile = () => {
  const { user } = useUser();
  const xpQuery = trpc.retrieveUserScore.useQuery({ userId: user?.sub ?? "" });
  return (
    <>
      <Flex direction="column" alignItems={"center"} mt={10}>
        <Heading mb={10}>Profile - {user?.name}</Heading>
        <HomeBtn />
        {xpQuery.isLoading ? (
          <Spinner />
        ) : (
          <Text mt={5} fontSize="3xl">
            XP: {xpQuery.data}
          </Text>
        )}
      </Flex>
    </>
  );
};

export default Profile;
