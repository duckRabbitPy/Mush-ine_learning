import { Button, ButtonProps } from "@chakra-ui/react";
import Link from "next/link";

const HomeBtn = (props: ButtonProps) => (
  <Link href="/">
    <Button
      {...props}
      backgroundColor="#F2B443"
      fontFamily="rounded"
      letterSpacing="widest"
    >
      Home{" "}
    </Button>
  </Link>
);

export default HomeBtn;
