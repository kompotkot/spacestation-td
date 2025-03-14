import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTheme } from "../context/ThemeContext";
import Game7Logo from "./Game7Logo";
import styles from "../styles/Layout.module.css";

const Layout = ({ children, title = "Tower Defense" }) => {
    const router = useRouter();

    const {
        lightTheme,
        switchTheme,
        textMainColor,
        textOppositeColor,
        backgroundMainColor,
        backgroundShadowColor,
        nodeFetched,
        nodeUnknown,
    } = useTheme();

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content="Tower Defense" />
                <link rel="icon" href="/favicon.svg" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Nunito"
                />
            </Head>
            <div
                className={styles.container}
                style={{
                    color: textMainColor,
                    backgroundColor: backgroundMainColor,

                    border: "1px solid red",
                }}
            >
                <header>
                    <nav>
                        <ul
                            className={styles.site_nav}
                            style={{ backgroundColor: backgroundShadowColor, border: "1px solid yellow", }}
                        >
                            <li className={styles.nav_first} style={{ border: "1px solid green", }}>
                                <Link href="/">
                                    <Game7Logo />
                                </Link>
                            </li>
                            <li className={styles.nav_theme} style={{ border: "1px solid green", }}> 
                                <img
                                    className={styles.icon}
                                    onClick={switchTheme}
                                    src={
                                        lightTheme
                                            ? "sun-dark.svg"
                                            : "moon-light.svg"
                                    }
                                    alt="Theme Switch"
                                />
                            </li>
                        </ul>
                    </nav>
                </header>
                <main className={styles.main} style={{ border: "1px solid green", }}>{children}</main>
            </div>
        </>
    );
};

export default Layout;
