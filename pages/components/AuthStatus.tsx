import { useUser } from "@auth0/nextjs-auth0";
import { Flex, Text, Button } from "@chakra-ui/react";
import Link from "next/link";
import { brandColors } from "../_app";

const AuthStatus = () => {
  const { user } = useUser();
  const message = user
    ? `Signed in as ${user.name || "registered guest"}`
    : "Not signed in";
  const textColor = user ? brandColors.darkGreen : brandColors.red;
  return (
    <Flex align="center">
      <Text color={textColor} p={1}>
        {message}
      </Text>
      <Link href={user ? "/api/auth/logout" : "/api/auth/login"}>
        <Button
          m={2}
          size={"sm"}
          backgroundColor={brandColors.rust}
          color={"white"}
          _hover={{
            color: brandColors.blackBlue,
            backgroundColor: brandColors.lightGrey,
          }}
        >
          {user ? "Log Out" : "Log in"}
        </Button>
      </Link>
    </Flex>
  );
};

export default AuthStatus;
