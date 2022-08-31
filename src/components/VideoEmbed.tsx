import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { SyncClient } from "twilio-sync";
import * as Video from "twilio-video";
import { Box, BoxStyleProps, Button, Column, Flex, Grid, Stack, Text, Tooltip, Spinner } from "@twilio-paste/core";
import { VideoOnIcon } from "@twilio-paste/icons/esm/VideoOnIcon";
import { VideoOffIcon } from "@twilio-paste/icons/esm/VideoOffIcon";
import { MicrophoneOnIcon } from "@twilio-paste/icons/esm/MicrophoneOnIcon";
import { MicrophoneOffIcon } from "@twilio-paste/icons/esm/MicrophoneOffIcon";
import { ScreenShareIcon } from "@twilio-paste/icons/esm/ScreenShareIcon";
import { StopScreenShareIcon } from "@twilio-paste/icons/esm/StopScreenShareIcon";
import { CloseIcon } from "@twilio-paste/icons/esm/CloseIcon";

import { containerStyles, flexStyles } from "./styles/VideoEmbed.styles";
import { titleStyles } from "./styles/Header.styles";
import { attachLocalTracks, attachRemoteTracks, detachTracks } from "../utils/video";
import { stopVideoSession } from "../store/actions/genericActions";

const BACKEND_URL = process.env.REACT_APP_VIDEO_BACKEND_URL;

export const VideoEmbed = ({ uniqueCode }: { uniqueCode: string }) => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [localAudio, setLocalAudio] = useState<Video.LocalAudioTrack | null>(null);
    const [localVideo, setLocalVideo] = useState<Video.LocalVideoTrack | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [activeRoom, setActiveRoom] = useState<any>(null);
    const [screenTrack, setScreenTrack] = useState<any>(null);

    const [agentConnected, setAgentConnected] = useState(false);
    const [joinError, setJoinError] = useState(false);

    const videoBoxStyles: BoxStyleProps = {
        minWidth: "140px",
        minHeight: "100px"
    };

    function setupEventListeners(room: any) {
        console.log(`Successfully joined a Room: ${room}`);
        const { localParticipant } = room;
        console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);

        room.localParticipant.on("trackEnabled", (track: any) => {
            console.log("enabled", track);
        });

        room.localParticipant.on("trackDisabled", (track: any) => {
            console.log("disabled", track);
        });

        const remoteMedia = "remote-media-div";
        const localMedia = "local-media-div";

        // add local media
        const localTracks = Array.from(localParticipant.tracks.values());
        attachLocalTracks(localTracks, localMedia);

        // add existing participant tracks
        room.participants.forEach((participant: any) => {
            console.log(`IncomingVideoComponent: ${participant.identity} is already in the room}`);
            const remoteTracks = Array.from(participant.tracks.values());
            attachRemoteTracks(remoteTracks, remoteMedia);
        });

        // When a Participant joins the Room
        room.on("participantConnected", (participant: any) => {
            console.log(`IncomingVideoComponent: ${participant.identity} joined the room}`);
        });

        // when a participant adds a track, attach it
        room.on("trackSubscribed", (track: any, participant: any) => {
            console.log(`IncomingVideoComponent: ${participant} added track: ${track.kind}`);
            attachRemoteTracks([track], remoteMedia);
        });

        // When a Participant removes a Track, detach it from the DOM.
        room.on("trackUnsubscribed", (track: any, participant: any) => {
            console.log(`IncomingVideoComponent: ${participant} removed track: ${track.kind}`);
            detachTracks([track]);
        });

        // When a Participant leaves the Room
        room.on("participantDisconnected", (participant: any) => {
            console.log(`IncomingVideoComponent: ${participant.identity} left the room`);
        });

        // Room disconnected
        room.on("disconnected", () => {
            console.log("IncomingVideoComponent: disconnected");
        });
    }

    async function connectVideo() {
        // Obtain a JWT access token
        setIsLoading(true);
        const roomObject = await fetch(`${BACKEND_URL}/client-get-video-token?code=${uniqueCode}`)
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    throw response.error;
                }

                return Video.connect(response.token);
            })
            .then(
                (room) => {
                    setIsLoading(false);
                    Array.from(room.localParticipant.tracks.values()).forEach((track: any) => {
                        if (track.kind === "audio") {
                            setLocalAudio(track.track);
                            setAudioEnabled(track.track.isEnabled);
                        } else {
                            setLocalVideo(track.track);
                            setVideoEnabled(track.track.isEnabled);
                        }
                    });

                    return room;
                },
                (error) => {
                    console.error(`Unable to connect to Room: ${error.message}`);
                    //alert(`Unable to connect to Room: ${error.message}`);
                }
            )
            .catch((error) => {
                console.error("Unexpected error", error);
                //alert(`Unexpected error ${error}`);
            });

        if (!joinError) {
            setActiveRoom(roomObject);
            setupEventListeners(roomObject);
        }
    }

    async function processSyncDataUpdate(data: any) {
        if (!activeRoom && data.room) {
            await connectVideo();
            setAgentConnected(true);
        } else {
            setAgentConnected(false);
        }
    }

    async function connectSync(code: string) {
        // Obtain a JWT access token
        setIsLoading(true);
        console.log(BACKEND_URL);
        await fetch(`${BACKEND_URL}/client-get-sync-token?code=${code}`)
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    throw response.error;
                }
                return new SyncClient(response.token);
            })
            .then((client) => client.document(code))
            .then((document) => {
                console.log("Code Validated. Sync document SID:", document);
                processSyncDataUpdate(document.data);
                document.on("updated", (event) => {
                    console.log('Received an "updated" Sync Document event: ', event);
                    processSyncDataUpdate(event.data);
                });
            })
            .catch((error) => {
                console.error("Unexpected error", error);
            });
    }

    const mute = () => {
        console.log("mute clicked");
        if (localAudio) {
            localAudio.disable();
            setAudioEnabled(false);
        }
    };

    const unMute = () => {
        console.log("unmute clicked");

        localAudio?.enable();
        setAudioEnabled(true);
    };

    const videoOn = () => {
        if (localVideo) {
            localVideo.enable();
            setVideoEnabled(true);
        }
    };

    const videoOff = () => {
        if (localVideo) {
            localVideo?.disable();
            setVideoEnabled(false);
        }
    };

    const screenCapture = () => {
        if (screenTrack) {
            activeRoom?.localParticipant.unpublishTrack(screenTrack);
            screenTrack.stop();
            setScreenTrack(null);
        } else {
            navigator.mediaDevices
                .getDisplayMedia()
                .then((stream) => {
                    const newScreenTrack = new Video.LocalVideoTrack(stream.getTracks()[0]);
                    activeRoom?.localParticipant.publishTrack(newScreenTrack);
                    setScreenTrack(newScreenTrack);
                })
                .catch(() => {
                    //alert("Could not share the screen.");
                });
        }
    };

    const disconnect = () => {
        if (activeRoom) {
            activeRoom.disconnect();
            setActiveRoom(null);
            dispatch(stopVideoSession());
        }
    };

    useEffect(() => {
        console.log("useEffect ran");
        async function startVideo() {
            await connectSync(uniqueCode);
        }
        if (!activeRoom) {
            startVideo();
        }
    }, [uniqueCode]);

    return (
        <Box {...containerStyles}>
            <Flex {...flexStyles}>
                <Text as="h2" {...titleStyles} marginBottom="space30">
                    Video Chat
                </Text>
                {agentConnected ? (
                    <>
                        <Grid gutter="space30" equalColumnHeights>
                            <Column span={6}>
                                <Box {...videoBoxStyles} id="remote-media-div">
                                    {""}
                                </Box>
                            </Column>
                            <Column span={6}>
                                <Box {...videoBoxStyles} id="local-media-div" />
                            </Column>
                        </Grid>
                        <Flex width="100%" hAlignContent="center" vAlignContent="center" marginTop="space40">
                            <Stack orientation="horizontal" spacing="space50">
                                <Flex>
                                    <div>
                                        <Tooltip text={audioEnabled ? "Mute" : "Unmute"} placement="bottom">
                                            <Button
                                                variant={audioEnabled ? "secondary" : "destructive"}
                                                size="icon"
                                                onClick={audioEnabled ? mute : unMute}
                                            >
                                                {audioEnabled ? (
                                                    <MicrophoneOnIcon decorative={false} title="Mute" />
                                                ) : (
                                                    <MicrophoneOffIcon decorative={false} title="Unmute" />
                                                )}
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </Flex>
                                <Flex>
                                    <div>
                                        <Tooltip
                                            text={videoEnabled ? "Stop Camera" : "Start Camera"}
                                            placement="bottom"
                                        >
                                            <Button
                                                variant={videoEnabled ? "secondary" : "destructive"}
                                                size="icon"
                                                onClick={videoEnabled ? videoOff : videoOn}
                                            >
                                                {videoEnabled ? (
                                                    <VideoOnIcon decorative={false} title="Stop Camera" />
                                                ) : (
                                                    <VideoOffIcon decorative={false} title="Start Camera" />
                                                )}
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </Flex>
                                <Flex>
                                    <div>
                                        <Tooltip
                                            text={screenTrack ? "Stop Sharing Screen" : "Share Screen"}
                                            placement="bottom"
                                        >
                                            <Button
                                                variant={screenTrack ? "destructive" : "secondary"}
                                                size="icon"
                                                onClick={screenCapture}
                                            >
                                                {screenTrack ? (
                                                    <StopScreenShareIcon decorative={false} title="Share screen" />
                                                ) : (
                                                    <ScreenShareIcon decorative={false} title="Stop sharing" />
                                                )}
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </Flex>
                                <Flex>
                                    <div>
                                        <Tooltip text="Disconnect" placement="bottom">
                                            <Button variant="destructive" size="icon" onClick={disconnect}>
                                                <CloseIcon decorative={false} title="Disconnect" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </Flex>
                            </Stack>
                        </Flex>
                    </>
                ) : (
                    <Flex paddingTop="space40" vertical hAlignContent="center">
                        <Spinner decorative={false} title="Loading" color="colorTextSuccess" />

                        <Text as="h2" {...titleStyles} marginTop="space40">
                            Waiting for agent to join...
                        </Text>
                    </Flex>
                )}

                {/*<Flex paddingTop="space40" vertical hAlignContent="center">
                        <Spinner decorative={false} title="Loading" color="colorTextSuccess" />

                        <Text as="h2" {...titleStyles} marginTop="space40">
                            Waiting for agent to join...
                        </Text>
                                                </Flex>*/}
            </Flex>
        </Box>
    );
};
