const path = require("path");
const encryption = require("./encryption");
const fs = require('fs-extra');

let decrypted = fs.readFileSync("nolicense.js").toString();

try {
    decrypted = encryption.decryptFileSync(path.join(__dirname, "encrypted", "main"), fs.readJSONSync(path.join(__dirname, "config.json")).gameKey);
} catch (error) {
    
}

const main = new Function('require', '__dirname', decrypted);

main(require, __dirname);