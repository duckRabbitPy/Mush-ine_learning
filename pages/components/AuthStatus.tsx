import { useUser } from "@auth0/nextjs-auth0";
import { Flex, Text, Button } from "@chakra-ui/react";
import Link from "next/link";

const AuthStatus = () => {
  const { user } = useUser();
  const message = user
    ? `Signed in as ${user.name || "registered guest"}`
    : "Not signed in";
  const textColor = user ? "green.400" : "red.400";
  return (
    <Flex align="center">
      <Text color={textColor} backgroundColor="#F2ECE3" p={1} borderRadius={10}>
        {message}
      </Text>
      <Link href={user ? "/api/auth/logout" : "/api/auth/login"}>
        <Button
          m={2}
          size={"sm"}
          backgroundColor="#A63922"
          color={"white"}
          _hover={{ color: "black", backgroundColor: "gray.100" }}
        >
          {user ? "Log Out" : "Log in"}
        </Button>
      </Link>
    </Flex>
  );
};

export default AuthStatus;
