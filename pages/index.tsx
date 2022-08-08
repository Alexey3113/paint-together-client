import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.scss";

const Home: NextPage = () => {
    const router = useRouter();

    const handleStartGame = () => {
        const alfabet: string =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$^";
        let str: string = "";
        for (let i = 0; i < 30; i++) {
            if (i === 9 || i === 13 || i === 19) {
                str += "K";
                continue;
            }
            str += alfabet[Math.floor(Math.random() * alfabet.length)];
        }
        router.push(`/game/${str}`);
    };

    return (
        <>
            <Head>
                <title>PAINT TOGETHER</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.container}>
                <h1 className={styles.title}>PAINT TOGETHER</h1>
                <p>Создайте с друзьями красивый и профессиональый шедевр</p>
                <button
                    onClick={handleStartGame}
                    className={styles.startGameButton}
                >
                    Рисовать вместе
                </button>
            </div>
        </>
    );
};

export default Home;
