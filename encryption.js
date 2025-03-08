const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const JavaScriptObfuscator = require('javascript-obfuscator');

const encryptHeader = "SweatyCircle439 Encryption Script V1.0.0\n";

function deriveKey(keyNumber) {
    const keyBuffer = Buffer.from(String(keyNumber));
    return crypto.createHash('sha256').update(keyBuffer).digest();
}

/**
 * 
 * @param {any} value 
 * @param {String} encryptionKey 
 */

function encrypt(value, encryptionKey) {
    const encryptableValue = encryptHeader + JSON.stringify(value);
    const encryptionNum = encryptionKey.split("").map(char => char.charCodeAt(0)).join("");
    const key = deriveKey(encryptionNum);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(encryptableValue, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + encrypted;
}

/**
 * 
 * @param {String} encryptedValue 
 * @param {String} encryptionKey 
 */

function decrypt(encryptedValue, encryptionKey) {
    const keyNumber = encryptionKey.split("").map(char => char.charCodeAt(0)).join("");
    const key = deriveKey(keyNumber);
    const iv = Buffer.from(encryptedValue.slice(0, 32), 'hex');
    const encryptedText = encryptedValue.slice(32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    if (!decrypted.startsWith(encryptHeader)) {
        throw new Error("decryption key is invalid");
    }
    const lst = decrypted.split(encryptHeader);
    lst.shift();
    return JSON.parse(lst.join(encryptHeader));
}

function encryptFileSync(file, encryptionKey, shouldObfiscate = false) {
    let res = fs.readFileSync(file).toString();
    if (shouldObfiscate) {
        res = JavaScriptObfuscator.obfuscate(res).getObfuscatedCode();
    }
    console.log(res);
    return encrypt(res, encryptionKey);
}

function decryptFileSync(file, encryptionKey) {
    return decrypt(fs.readFileSync(file).toString(), encryptionKey);
}

function encryptDirSync(dir, encryptionKey) {
    /**
     * 
     * @param {String} dir 
     * @returns {{type: String, name: String, contents?: String|tree.returns}}
     */
    function tree(dir) {
        const objects = [];
        console.log(dir);
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (fs.lstatSync(path.join(dir, file)).isDirectory()) {
                if (file !== "node_modules") {
                    objects.push({
                        type: "directory",
                        name: file,
                        contents: tree(path.join(dir, file))
                    });
                }
            } else {
                objects.push({
                    type: "file",
                    name: file,
                    contents: fs.readFileSync(path.join(dir, file))
                })
            }
        }
        return objects;
    }
    return encrypt(tree(dir), encryptionKey);
}

module.exports = {
    encrypt,
    decrypt,
    encryptFileSync,
    decryptFileSync,
    encryptDirSync
}