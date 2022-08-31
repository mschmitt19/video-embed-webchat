import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Stack } from "@twilio-paste/core";
import { Flex } from "@twilio-paste/core/flex";
import { Text } from "@twilio-paste/core/text";
import { VideoOnIcon } from "@twilio-paste/icons/esm/VideoOnIcon";

import { startVideoSession } from "../store/actions/genericActions";

export const JoinVideoMessage = ({ uniqueCode }: { uniqueCode: string | undefined }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [buttonText, setButtonText] = useState("Join Video Room");

    function joinVideoClicked() {
        setIsLoading(true);
        setButtonText("loading");
        if (uniqueCode) dispatch(startVideoSession(uniqueCode));
    }

    return (
        <Flex>
            <Flex
                paddingLeft="space0"
                paddingRight="space0"
                marginTop="space20"
                vertical
                hAlignContent="center"
                overflow="visible"
            >
                <Stack orientation="vertical" spacing="space20">
                    <Button
                        variant="destructive"
                        onClick={() => joinVideoClicked()}
                        loading={isLoading}
                        style={{ background: "#F22F46" }}
                    >
                        {buttonText}
                        <VideoOnIcon decorative size="sizeIcon30" title="Switch to Video" />
                    </Button>
                    <Text as="p" fontSize="fontSize20" fontWeight="fontWeightMedium" color="colorText">
                        Click to join the video room!
                    </Text>
                </Stack>
            </Flex>
        </Flex>
    );
};
