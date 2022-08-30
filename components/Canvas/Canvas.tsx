import { NextRouter, useRouter } from "next/router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { ICanvasCoords } from "../../pages/game/[id]";

import styles from "./Canvas.module.scss";
import stylesGame from "../../styles/Game.module.scss";

interface ICanvasProps {
    onMouseMove: (data: ICanvasCoords) => void;
    onInit: (canvasCtx: CanvasRenderingContext2D) => void;
    clearPicture: (ref: HTMLCanvasElement | null) => void;
    sendImage: (ref: HTMLCanvasElement | null) => void;
    nowColor: string;
    setNowColor: React.Dispatch<React.SetStateAction<string>>;
    canvasContainer: React.RefObject<HTMLDivElement>;
}

export const Canvas: React.FC<ICanvasProps> = ({
    onMouseMove,
    onInit,
    clearPicture,
    sendImage,
    nowColor,
    setNowColor,
    canvasContainer,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    let context: any = "";

    const router: NextRouter = useRouter();

    const handleChangeColor = (color: string) => {
        context.strokeStyle = color;
        setNowColor(color);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_CLIENT_URL}/game/${router.query.id}`
        );
        alert("Ссылка скопирована");
    };

    const handleChangeColorToEraser = () => {
        context.strokeStyle = "white";
        setNowColor("white");
    };

    const handleClear = () => {
        if (canvasRef.current) {
            clearPicture(canvasRef.current);
        }
    };

    const colors = useMemo(
        () => [
            "#F4352BFF",
            "#AB00F4FF",
            "#603EF4FF",
            "#0E72F4FF",
            "#2BF482FF",
            "#7AF464FF",
            "#E2F41DFF",
            "#F435BBFF",
        ],
        []
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            var x = e.offsetX;
            var y = e.offsetY;
            var dx = e.movementX;
            var dy = e.movementY;

            if (e.buttons > 0) {
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x - dx, y - dy);
                context.stroke();
                context.closePath();

                onMouseMove({ x, y, dx, dy, color: context.strokeStyle });
            }
        },
        [context]
    );

    useEffect(() => {
        console.log("canvasContainer");
        if (!context && canvasRef?.current) {
            context = canvasRef?.current?.getContext("2d");
            onInit(context);
            const img = new Image();
            let containerHeight: number = 1000,
                containerWidth: number = 600;
            if (canvasContainer.current) {
                containerHeight =
                    canvasContainer?.current?.getBoundingClientRect().height >
                    600
                        ? 600
                        : Number(
                              canvasContainer?.current?.getBoundingClientRect()
                                  .height
                          ) - 80;
                containerWidth =
                    canvasContainer?.current?.getBoundingClientRect().width >
                    1000
                        ? 1000
                        : Number(
                              canvasContainer?.current?.getBoundingClientRect()
                                  .width
                          ) - 60;
            }
            img.src = "";
            img.onload = () => {
                context.drawImage(img, 0, 0, containerWidth, containerHeight);
            };
            //

            canvasRef.current.height = containerHeight;
            canvasRef.current.width = containerWidth;

            context.lineCap = "round";
            context.lineWidth = 8;
            context.strokeStyle = "#F4352BFF";

            canvasRef?.current?.addEventListener("mousemove", handleMouseMove);
            canvasRef?.current?.addEventListener("mouseup", () =>
                sendImage(canvasRef.current)
            );
        }
        // for real prod
        // return () => canvasRef.current?.removeEventListener("mousemove", handleMouseMove)
    }, []);

    return (
        <>
            <canvas className={styles.root} ref={canvasRef} id="paint"></canvas>
            <div className={styles.colors}>
                {colors.map((el: string, i: number) => (
                    <div
                        key={i}
                        style={{ background: el }}
                        className={`${styles.colorsItem} ${
                            nowColor === el ? styles.activeItem : ""
                        }`}
                        onClick={() => handleChangeColor(el)}
                    ></div>
                ))}
                <span onClick={handleClear}>Очистить Полотно</span>
                <span onClick={handleChangeColorToEraser}>
                    Использовать Ластик
                </span>
                <span onClick={handleCopyLink}>Пригласить друзей</span>
            </div>
        </>
    );
};
