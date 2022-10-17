import { Button } from "@chakra-ui/react";
import Link from "next/link";

const HomeBtn = () => (
  <Link href="/">
    <Button m={2}>Home </Button>
  </Link>
);

export default HomeBtn;
