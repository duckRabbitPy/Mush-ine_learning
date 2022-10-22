import { Button, ButtonProps } from "@chakra-ui/react";
import Link from "next/link";

const HomeBtn = (props: ButtonProps) => (
  <Link href="/">
    <Button {...props}>Home </Button>
  </Link>
);

export default HomeBtn;
