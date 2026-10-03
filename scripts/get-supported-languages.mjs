import fs from "fs";
import apiRequest from "../src/modules/api-request.mjs";

try {
    const endpoints = await apiRequest("endpoints");
    const allLangs = endpoints.languages;
    fs.writeFileSync("./src/data/supported-languages.json", JSON.stringify(allLangs, null, 4));
} catch (error) {
    if (process.env.CI) {
        throw error;
    } else {
        console.log(error);
        console.log("attempting to get supported languages (offline mode?)");
    }
}
