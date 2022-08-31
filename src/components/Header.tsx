import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { useSelector } from "react-redux";

import { AppState } from "../store/definitions";
import { containerStyles, titleStyles } from "./styles/Header.styles";
import { VideoEmbed } from "./VideoEmbed";

export const Header = ({ customTitle }: { customTitle?: string }) => {
    const videoRoomCode = useSelector((state: AppState) => state.chat.videoRoomCode);
    return (
        <Box as="header" {...containerStyles}>
            {videoRoomCode ? (
                <VideoEmbed uniqueCode={videoRoomCode} />
            ) : (
                <Text as="h2" {...titleStyles}>
                    {customTitle || "Live Chat"}
                </Text>
            )}
        </Box>
    );
};
