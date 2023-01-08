import { Button, ButtonProps } from "@chakra-ui/react";
import Link from "next/link";
import { brandColors } from "../_app";

const HomeBtn = (props: ButtonProps) => (
  <Link href="/">
    <Button
      {...props}
      backgroundColor={brandColors.sunYellow}
      fontFamily="rounded"
      letterSpacing="widest"
    >
      Home{" "}
    </Button>
  </Link>
);

export default HomeBtn;
