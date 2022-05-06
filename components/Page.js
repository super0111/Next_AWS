import React from "react";
import Meta from "./Meta.js";
import Head from "next/head";
// eslint-disable-next-line react/prefer-stateless-function
export default function Page(props) {

    return (
        <>
            <Meta />
            <Head>
                <title>
                    Inferencehub
                </title>
            </Head>
            <div>
                {props.children}
            </div>
        </>
    );
}
