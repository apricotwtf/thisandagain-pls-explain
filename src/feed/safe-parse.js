export default function transferHTMLToContent(html, document) {
    const smilieReplaces = Object.assign(Object.create(null), {
        smile: ":slight_smile:",
        neutral: ":neutral_face:",
        sad: ":frowning:",
        big_smile: ":smiley:",
        yikes: ":open_mouth:",
        wink: ":wink:",
        hmm: ":thinking:",
        tongue: ":stuck_out_tongue:",
        lol: ":smile:",
        mad: ":weary:",
        roll: ":rolling_eyes:",
        cool: ":sunglasses:",
    });

    const images = html.querySelectorAll("img");
    for (const image of images) {
        const source = image.getAttribute("src");
        if (
            /\/\/cdn\.scratch\.mit\.edu\/scratchr2\/static\/(.*)\/djangobb_forum\/img\/smilies\/[a-z_]{3,9}\.png/.test(
              source
            )
          ) {
            if (smilieReplaces[source.split("smilies/")[1].split(".")[0]]) {
                image.parentNode.insertBefore(
                    document.createTextNode(smilieReplaces[source.split("smilies/")[1].split(".")[0]]),
                    image
                );
                image.remove();
            }
          } 
    }

    return html;
}