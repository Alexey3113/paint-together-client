import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, {
    ChangeEvent,
    KeyboardEvent,
    Ref,
    RefObject,
    useCallback,
    useEffect,
    useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { Canvas } from "../../components/Canvas/Canvas";
import Button from "../../components/UI/Button/Button";
import NicknameModal from "../../components/UI/Modals/NicknameModal";
import styles from "../../styles/Game.module.scss";

export interface ICanvasCoords {
    x: number;
    y: number;
    dx: number;
    dy: number;
    color: string;
}

export interface IMessage {
    userName: string;
    mes: string;
}

const Game: NextPage = () => {
    const [messageValue, setMessageValue] = useState<string>("");
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [newAddedMessage, setNewAddedMessage] = useState<IMessage>({
        mes: "-1",
        userName: "-1",
    });
    const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
    const [nickName, setNickname] = useState<string>("");
    const [nowColor, setNowColor] = useState<string>("#F4352BFF");

    const socketRef = React.useRef<Socket>();
    let canvasRef = React.useRef<CanvasRenderingContext2D>();
    const canvasContainer = React.useRef<HTMLDivElement>(null);

    const router = useRouter();

    useEffect(() => {
        if (!!router.query.id && !socketRef.current) {
            socketRef.current = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);

            socketRef.current.emit("joinRoom", router.query.id);

            socketRef.current.on("painting", asyncTakeAndPaintDataFromUser);
            socketRef.current.on("clearing_picture", () =>
                canvasRef?.current?.clearRect(0, 0, 1000, 600)
            );
            socketRef.current.on("get_message", asyncTakeMessageFromUser);
            socketRef.current.on("init_img", asyncTakeImg);
            socketRef.current.emit("init_img", router.query.id);

            // return () => {
            //     socketRef.current?.disconnect();
            // };
        }
    }, [router]);

    const handleSendCoordinatesToUsers = useCallback(
        (data: ICanvasCoords) => {
            if (socketRef.current) {
                socketRef.current.emit("paint", data);
            }
        },
        [socketRef.current]
    );
    const handleClearPicture = useCallback(
        (ref: HTMLCanvasElement | null) => {
            if (socketRef.current && canvasRef.current && ref) {
                canvasRef.current.clearRect(0, 0, 1000, 600);
                socketRef.current.emit("clear_picture");
                socketRef.current.emit("sending_img", {
                    data: ref.toDataURL(),
                    room: router.query.id,
                });
            }
        },
        [socketRef.current, canvasRef.current]
    );

    const asyncTakeAndPaintDataFromUser = ({
        x,
        y,
        dx,
        dy,
        color,
    }: ICanvasCoords) => {
        if (canvasRef.current) {
            canvasRef.current.strokeStyle = color;
            canvasRef.current.beginPath();
            canvasRef.current.moveTo(x, y);
            canvasRef.current.lineTo(x - dx, y - dy);
            canvasRef.current.stroke();
            canvasRef.current.closePath();
            setNowColor(color);
        }
    };

    const handleSendMessageToUsers = useCallback(() => {
        if (socketRef.current) {
            if (messageValue) {
                setMessages([
                    ...messages,
                    { mes: messageValue, userName: "Вы" },
                ]);
                socketRef.current.emit("send_message", {
                    mes: messageValue,
                    userName: nickName,
                });
                setMessageValue("");
            }
        }
    }, [messageValue, messageValue, socketRef.current]);

    const asyncTakeMessageFromUser = ({ mes, userName }: IMessage) => {
        setNewAddedMessage({ mes, userName });
    };

    const asyncTakeImg = (data: any) => {
        const img = new Image();
        img.src = data;
        img.onload = () => {
            if (canvasRef.current) {
                canvasRef.current.drawImage(img, 0, 0, 1000, 600);
            }
        };
    };

    const handleSendImg = useCallback(
        (ref: HTMLCanvasElement | null) => {
            if (socketRef.current && canvasRef.current && ref) {
                socketRef.current.emit("sending_img", {
                    data: ref.toDataURL(),
                    room: router.query.id,
                });
            }
        },
        [socketRef.current, router]
    );

    const handleChangeValueFiled = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setMessageValue(e.target.value);
        },
        []
    );

    const handleUseKeyEnter = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.keyCode === 13) {
                handleSendMessageToUsers();
            }
        },
        [messageValue]
    );
    const callbackBtnClick = useCallback((e: string) => {
        setNickname(e);
        setIsModalOpen(false);
    }, []);

    useEffect(() => {
        if (newAddedMessage.userName !== "-1") {
            setMessages([...messages, newAddedMessage]);
        }
    }, [newAddedMessage]);

    return (
        <>
            <Head>
                <title>PAINT TOGETHER START GAME</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.game}>
                <div className={styles.chat}>
                    <div className={styles.chatTitle}>Чат</div>
                    <div className={styles.chatMessage}>
                        {messages.map((el: IMessage, i: number) => (
                            <div key={i} className={styles.chatItem}>
                                <b> {el.userName} </b>
                                <p> {el.mes} </p>
                            </div>
                        ))}
                        {messages.length === 0 && (
                            <div style={{ textAlign: "center" }}>
                                Пока еще пусто
                            </div>
                        )}
                    </div>
                    <div className={styles.chatInput}>
                        <input
                            onChange={handleChangeValueFiled}
                            onKeyDown={handleUseKeyEnter}
                            value={messageValue}
                            type="text"
                        />
                        <Button
                            title="Отправить"
                            onClick={handleSendMessageToUsers}
                        />
                    </div>
                </div>

                <div ref={canvasContainer} className={styles.canvas}>
                    <Canvas
                        onMouseMove={handleSendCoordinatesToUsers}
                        onInit={(canvasCtx: CanvasRenderingContext2D) =>
                            (canvasRef.current = canvasCtx)
                        }
                        sendImage={handleSendImg}
                        clearPicture={handleClearPicture}
                        nowColor={nowColor}
                        setNowColor={setNowColor}
                        canvasContainer={canvasContainer}
                    />
                </div>
            </div>
            <NicknameModal
                setIsModalOpen={setIsModalOpen}
                isModalOpen={isModalOpen}
                callbackBtnClick={callbackBtnClick}
            />
        </>
    );
};

export default Game;

export async function getServerSideProps<GetServerSideProps>(
    context: GetServerSidePropsContext
) {
    try {
        const { id } = context.query;
        if (
            id?.length === 30 &&
            id[9] === "K" &&
            id[13] === "K" &&
            id[19] === "K"
        ) {
        } else {
            context.res.setHeader("Location", `/`);
            context.res.statusCode = 302;
            context.res.end();
        }
        return {
            props: {},
        };
    } catch (e) {
        return {
            props: {},
        };
    }
}
