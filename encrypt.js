const { randomUUID } = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const encryption = require("./encryption");

const json = fs.readJSONSync(path.join(__dirname, "config.json"));

const gameKey = randomUUID();

json.gameKey = gameKey;

fs.ensureDirSync(path.join(__dirname, "encrypted"));
fs.writeFileSync(path.join(__dirname, "encrypted", "main"), encryption.encryptFileSync(path.join(__dirname, "main.js"), gameKey, true));

fs.writeJsonSync(path.join(__dirname, "config.json"), json);