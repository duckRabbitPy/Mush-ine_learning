import { Button, ButtonProps, Icon } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { IconType } from "react-icons";

type CustomBtnProps = {
  children: React.ReactNode;
  color: `#${string}`;
  href?: string;
  sound?: "click";
  icon?: IconType;
  styles?: ButtonProps;
};

export const CustomBtn = ({
  children,
  color,
  sound,
  href,
  icon,
  styles,
}: CustomBtnProps) => {
  const soundLookup = {
    click: "/clickSound.mp3",
  };
  const clickSound =
    sound && new Audio(soundLookup[sound as keyof typeof soundLookup]);

  const wrapper = () => <Link href={"dd"}>{children}</Link>;

  return href ? (
    <Link href={href}>
      <Button
        m={2}
        color={"white"}
        backgroundColor={color}
        onClick={() => clickSound?.play()}
        _hover={{ color: "black", backgroundColor: "gray.100" }}
        {...styles}
      >
        {children}
        {icon && <Icon as={icon} ml={2} />}
      </Button>
    </Link>
  ) : (
    <Button
      m={2}
      color={"white"}
      backgroundColor={color}
      onClick={() => clickSound?.play()}
      _hover={{ color: "black", backgroundColor: "gray.100" }}
      {...styles}
    >
      {children}
      {icon && <Icon as={icon} ml={2} />}
    </Button>
  );
};

export default CustomBtn;
