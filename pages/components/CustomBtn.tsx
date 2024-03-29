import { Button, ButtonProps, Icon, Tooltip } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { IconType } from "react-icons";
import useSound from "../../hooks/useSound";
import { brandColors, HexBrandColors } from "../_app";

type CustomBtnProps = {
  children: React.ReactNode;
  brandColor: HexBrandColors;
  href?: string;
  icon?: IconType;
  styles?: ButtonProps;
  tooltipContent?: string;
  openLinkInNewTab?: boolean;
};

export const CustomBtn = ({
  children,
  brandColor,
  href,
  icon,
  tooltipContent,
  styles,
  openLinkInNewTab,
}: CustomBtnProps) => {
  const { clickSound } = useSound();

  const btnContent = href ? (
    <Link href={href} target={openLinkInNewTab ? "_blank" : undefined}>
      <Button
        m={2}
        color={"white"}
        fontFamily="rounded"
        letterSpacing={"0.1rem"}
        backgroundColor={brandColor}
        onClick={() => clickSound?.play()}
        _hover={{
          color: brandColors.blackBlue,
          backgroundColor: brandColors.lightGrey,
        }}
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
      backgroundColor={`brand.${brandColor}`}
      onClick={() => clickSound?.play()}
      _hover={{ color: "black", backgroundColor: "gray.100" }}
      {...styles}
    >
      {children}
      {icon && <Icon as={icon} ml={2} />}
    </Button>
  );

  return tooltipContent ? (
    <Tooltip
      label={tooltipContent}
      hasArrow
      placement="top-start"
      openDelay={500}
    >
      {btnContent}
    </Tooltip>
  ) : (
    btnContent
  );
};

export default CustomBtn;
