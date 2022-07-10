import { WebhookClient, MessageEmbed } from "discord.js";
import { DOMParser } from "linkedom";
import fetch from "node-fetch";
import { webhookURL } from "./constants.js";

const client = new WebhookClient({ url: webhookURL });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    let lastIndexedPost = 0;
    while (true) {
        const feedRes = await fetch(`https://scratch.mit.edu/discuss/feeds/forum/31/`);
        const feedXml = await feedRes.text();
        const feedDoc = new DOMParser().parseFromString(feedXml, "text/xml");

        const posts = [...feedDoc.querySelectorAll("entry")].reverse();
        for (const post of posts) {
            const id = Number(post.querySelector("id").textContent);
            if (id <= lastIndexedPost) continue;

            const title = post.querySelector("title").textContent;
            const content = post.querySelector("summary").textContent.replace(/\n/g, " ").replace(/&[a-z];/g, " ").replace(/<blockquote>((.|\n)*)<\/blockquote>/g, "").replace(/<((.|\n)*)>((.|\n)*)<\/((.|\n)*)>/g, "$2");
            const author = post.querySelector("author > name").textContent;
            const date = post.querySelector("published").textContent;

            const ocular = await fetch(`https://my-ocular.jeffalo.net/api/user/${author}`).then(res => res.json()).catch(err => ({status:"",color:""}))

            const embed = new MessageEmbed()
                .setTitle(title.replace("About Scratch :: Advanced Topics :: ", ""))
                .setDescription(content)
                .setTimestamp(new Date(date))
                .setColor(ocular.color)
                .setURL(`https://scratch.mit.edu/discuss/post/${id}/`)
            
            embed.setAuthor({
                name: String(ocular.status || "").replace(/\n/g, " "),
                url: "https://scratch.mit.edu/users/" + author
            })

            await client.send({
                embeds: [embed],
                username: author,
                avatarURL: "https://my-ocular.jeffalo.net/api/user/" + author + "/picture",
            });
            lastIndexedPost = id;
        }
        sleep(4000);
    }
}

main()