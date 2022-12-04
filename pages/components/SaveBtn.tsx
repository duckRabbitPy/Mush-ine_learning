import { Button, ButtonProps } from "@chakra-ui/react";
import { useSound } from "../../hooks/useSound";

type SaveProps = {
  styles?: ButtonProps;
  handleSaveBtn: () => void;
  show: boolean;
};

export const SaveBtn = ({ styles, handleSaveBtn, show }: SaveProps) => {
  const { saveSound } = useSound();
  return (
    <Button
      onClick={() => {
        saveSound?.play();
        console.log(handleSaveBtn);
        handleSaveBtn();
      }}
      w="-moz-fit-content"
      alignSelf="center"
      backgroundColor="#B8E6F3"
      visibility={show ? "visible" : "hidden"}
      {...styles}
    >
      Save score
    </Button>
  );
};
