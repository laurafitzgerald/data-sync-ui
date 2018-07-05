import { urlencoded, json } from "body-parser";
import express from "express";
import { join } from "path";
import { port } from "./config";
import { sync, database } from "./models";
import { close as stopNotifier, addChannel, publish } from "./configNotifiers/configNotifierCreator";
import setupGraphQLServer from "./gql";

const App = express();
let server = null;

// Set-up payload parsers. We accept url encoded and json values
App.use(urlencoded({ extended: false }));
App.use(json());

App.use(express.static(join(__dirname, "../public")));

App.get("/", (req, res) => res.sendFile(join(__dirname, "../public/index.html")));

setupGraphQLServer(App);

// Catch all other requests and return "Not found"
App.get("*", (_, res) => res.sendStatus(404));

export const run = async callback => {
    await sync();
    server = App.listen(port, () => callback(App));
};

export const stop = () => {
    server.close();
    stopNotifier();
    database.close();
};
