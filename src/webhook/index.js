import { WebhookClient, MessageEmbed } from "discord.js";
import { DOMParser } from "linkedom";

import { webhookURL } from "../constants.js";
import { updateCache, getCacheItem } from "../lib/cache.js";
import { fetchOcular, fetchScratch, fetchWithCORS } from "./data.js";
import transferHTMLToContent from "./safe-parse.js";

const client = new WebhookClient({ url: webhookURL });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log("[webhook] Started");
    let lastIndexedPost = Number(getCacheItem("last-indexed-post") || "0");
    m: while (true) {
        console.log("[webhook] Fetching posts");
        const feedRes = await fetchWithCORS(`https://scratch.mit.edu/discuss/feeds/forum/31/?t=${Date.now()}`);
        let feed;
        try {
            feed = (await feedRes.text()).replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        } catch(ex) {
            console.log("Error parsing feed:", ex);
            continue m;
        }
        const feedDoc = new DOMParser().parseFromString(feed, "text/xml");

        const posts = [...feedDoc.querySelectorAll("entry")].reverse();
        const newPosts = [];
        const ocularCache = Object.create(null);
        const scratchCache = Object.create(null);
        let foundNewAtLeastOnce = false;

        for (const post of posts) {
            const id = Number(post.querySelector("id").textContent);
            if (id <= lastIndexedPost) {
                continue;
            };
            foundNewAtLeastOnce = true;

            const title = post.querySelector("title").textContent.replace(/\\n/g, " ");
            const content = transferHTMLToContent(post.querySelector("summary"), feedDoc).innerHTML.replace(/<blockquote>((.|\n)*)<\/blockquote>/g, "").replace(/(\\n|\n)/g, " ").replace(/&[a-z];/g, " ").replace(/<((.|\n)*)>((.|\n)*)<\/((.|\n)*)>/g, "$2");
            const author = post.querySelector("author > name").textContent;
            const date = post.querySelector("published").textContent;

            const ocular = await (ocularCache[author] || (ocularCache[author] = fetchOcular(author)));
            const scratch = await (scratchCache[author] || (scratchCache[author] = fetchScratch(author)));

            const embed = new MessageEmbed()
                .setTitle(title.replace("About Scratch :: Advanced Topics :: ", ""))
                .setDescription(content)
                .setTimestamp(new Date(date))
                .setColor(ocular.color)
                .setURL(`https://scratch.mit.edu/discuss/post/${id}/`)
            
            embed.setAuthor({
                name: author,
                url: "https://scratch.mit.edu/users/" + author,
                iconURL: `https://uploads.scratch.mit.edu/get_image/user/${scratch.id}_70x70.png`,
            })

            client.send({
                embeds: [embed],
                username: author,
                avatarURL: `https://uploads.scratch.mit.edu/get_image/user/${scratch.id}_70x70.png`,
            });
            newPosts.push({
                id,
                author
            })

            console.log(`Sent embed for post ${id} by ${author}`)

            lastIndexedPost = id;
        }

        foundNewAtLeastOnce && updateCache({ "last-indexed-post": lastIndexedPost }) && console.log(`[webhook] Found new posts (${newPosts.map(p => p.id).join(", ")}), updating cache...`);
        !foundNewAtLeastOnce && console.log(`[webhook] No new posts found`);
        sleep(4000);
    }
}

main()