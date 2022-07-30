import { MessageEmbed } from "discord.js";

import { feedChannelID } from "../constants.js";
import { updateCache, getCacheItem } from "../lib/cache.js";
import { fetchOcular, fetchScratch, fetch } from "./data.js";
import parseSafeHTML from "./safe-parse.js";
import db from "../database.js";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/** @param {import("discord.js").Client} client */
export default async function main(client) {
    const channel = await client.channels.fetch(feedChannelID)
    console.log("[feed]: started");
    let lastIndexedPost = Number(getCacheItem("last-indexed-post") || "0");
    m: while (true) {
        console.log("[feed]: fetching posts");
        const feedRes = await fetch("https://vercel-scratch-proxy.vercel.app/api/djangobb/feed?f=31&accurateBB&t=" + Date.now());
        const feed = await feedRes.json();

        let foundNewAtLeastOnce = false;
        const ocularCache = Object.create(null)
        const scratchCache = Object.create(null);

        const toSend = [];
        for (const post of feed) {
            if (post.id <= lastIndexedPost) {
                continue;
            };
            foundNewAtLeastOnce = true;

            const { content: { bb: content }, author, date } = post;
            console.log(`New post by ${author} at ${new Date(date)}`);

            const ocular = await (ocularCache[author] || (ocularCache[author] = fetchOcular(author)));
            const scratch = await (scratchCache[author] || (scratchCache[author] = fetchScratch(author)));

            const embed = new MessageEmbed()
                .setTitle(post.topic.title)
                .setDescription(
                    `${content.substring(0, 512)}`
                )
                .setTimestamp(new Date(date))
                .setColor(ocular.color)
                .setURL(`https://scratch.mit.edu/discuss/post/${post.id}/`);

            embed.setAuthor({
                name: author,
                url: `https://scratch.mit.edu/users/${author}/`,
                iconURL: `https://uploads.scratch.mit.edu/get_image/user/${scratch.id}_70x70.png`,
            });
            toSend.push(embed);
            lastIndexedPost = post.id;
        };
        if (toSend.length > 0) {
            // If there are more than 10 posts, send them in batches of 10. (thanks github copilot)
            const chunks = [];
            for (let i = 0; i < toSend.length; i += 10) {
                chunks.push(toSend.slice(i, i + 10));
            }
            for (const chunk of chunks) {
                await channel.send({
                    embeds: chunk,
                });
            }
        };
        updateCache({
            "last-indexed-post": lastIndexedPost,
        })
        await sleep(10000);
    }
}