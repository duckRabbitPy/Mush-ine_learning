import { useUser } from "@auth0/nextjs-auth0";
import { Flex, Text, Button, Icon } from "@chakra-ui/react";
import Link from "next/link";
import { BiUserCheck } from "react-icons/bi";
import { FiUserX } from "react-icons/fi";
import { brandColors } from "../_app";

const AuthStatus = () => {
  const { user } = useUser();
  const message = user
    ? `Signed in as ${user.name || "registered guest"}`
    : "Not signed in";

  return (
    <Flex align="center" p={5}>
      {user ? <Icon as={BiUserCheck} /> : <Icon as={FiUserX} />}
      <Text p={1}>{message}</Text>
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
