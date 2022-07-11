import fs from "node:fs";

export function updateCache(next) {
    const cache = JSON.parse(
        String(fs.readFileSync("src/.cache.json")) || ""
    );

    fs.writeFileSync("src/.cache.json", JSON.stringify(
        Object.assign(cache, next)
    ));

    return true;
}
export function getCache() {
    return JSON.parse(
        String(fs.readFileSync("src/.cache.json")) || ""
    );
}
export function getCacheItem(key) {
    return getCache()[key];
}