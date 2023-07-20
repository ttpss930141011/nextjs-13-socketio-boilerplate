"use client";
import { createStyles, Card, Container, Text, ScrollArea } from "@mantine/core";
import useSocketStore from "@/store/socket";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { MessageWithMe, SocketMessage } from "@/types/next";
import ChatroomTitle from "@/components/ChatroomTitle";
import ChatroomInput from "@/components/ChatroomInput";

const useStyles = createStyles((theme) => ({
    rightMessageField: {
        display: "flex",
        flexDirection: "row-reverse",
        width: "100%",
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    rightMessage: {
        width: "fit-content",
        padding: theme.spacing.xs,
        overflowWrap: "break-word",
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.green[2],
        maxWidth: "50em",
        [theme.fn.smallerThan("md")]: {
            maxWidth: "35em",
        },
        [theme.fn.smallerThan("sm")]: {
            maxWidth: "25em",
        },
        [theme.fn.smallerThan("xs")]: {
            maxWidth: "15em",
        },
    },
    leftMessageField: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    leftMessage: {
        width: "fit-content",
        padding: theme.spacing.xs,
        overflowWrap: "break-word",
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.gray[2],
        maxWidth: "50em",
        [theme.fn.smallerThan("md")]: {
            maxWidth: "35em",
        },
        [theme.fn.smallerThan("sm")]: {
            maxWidth: "25em",
        },
        [theme.fn.smallerThan("xs")]: {
            maxWidth: "15em",
        },
    },

    timestamp: {
        width: "fit-content",
        display: "flex",
        flexWrap: "nowrap",
        fontSize: theme.fontSizes.xs,
        color: theme.colors.gray[5],
        marginLeft: theme.spacing.xs,
        marginRight: theme.spacing.xs,
        alignItems: "flex-end",
    },
}));

export default function Home() {
    const { classes } = useStyles();
    const { socket, connect } = useSocketStore((state) => state); // deconstructing socket and its method from socket store
    const chatViewportRef = useRef<HTMLDivElement>(null); // binding chat viewport ref to scroll to bottom
    const [targetSocketId, setTargetSocketId] = useState<string>(""); // target socket id input value
    const [messages, setMessages] = useState<MessageWithMe[]>([]); // show messages on ScrollArea
    const scrollToBottom = () => {
        chatViewportRef?.current?.scrollTo({
            top: chatViewportRef.current.scrollHeight,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        connect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        console.log("socket", socket?.id);
        socket?.on("message", (message: SocketMessage) => {
            // console.log("message", message);
            setMessages((state) => [...state, { ...message, me: message.from === socket?.id }]);
        });
        return () => {
            socket?.off("message");
        };
    }, [socket]);

    useLayoutEffect(() => {
        scrollToBottom(); // Execute after DOM render
    }, [messages]);

    return (
        <>
            <Container size="md" h={"100vh"}>
                <Card shadow="sm" padding="sm" radius="md" withBorder h={"100%"}>
                    <Card.Section withBorder inheritPadding py="xs" h={"10%"}>
                        <ChatroomTitle
                            targetSocketId={targetSocketId}
                            setTargetSocketId={setTargetSocketId}
                        />
                    </Card.Section>
                    <ScrollArea offsetScrollbars viewportRef={chatViewportRef} h={"85%"}>
                        {messages.map((message, index) => {
                            return (
                                <div
                                    className={
                                        message.me
                                            ? classes.rightMessageField
                                            : classes.leftMessageField
                                    }
                                    key={message.timestamp + index}
                                >
                                    <Text
                                        className={
                                            message.me ? classes.rightMessage : classes.leftMessage
                                        }
                                    >
                                        {message.message.split("\n").map((line, index) => {
                                            return (
                                                <span key={message.timestamp + index}>
                                                    {line}
                                                    <br />
                                                </span>
                                            );
                                        })}
                                    </Text>
                                    <Text size="xs" className={classes.timestamp}>
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </Text>
                                </div>
                            );
                        })}
                    </ScrollArea>
                    <Card.Section withBorder inheritPadding h={"10%"}>
                        <ChatroomInput targetSocketId={targetSocketId} />
                    </Card.Section>
                </Card>
            </Container>
        </>
    );
}
