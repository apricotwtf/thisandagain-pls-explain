import fetch from "node-fetch";

export { fetch };
export async function fetchOcular(username) {
    try {
        const res = await fetch(`https://my-ocular.jeffalo.net/api/user/${username}`);
        const json = await res.json();
        return json;
    } catch(ex) {
        return {
            status: "",
            color: "",
        }
    }
}

export async function fetchScratch(username) {
    try {
        const res = await fetch(`https://vercel-scratch-proxy.vercel.app/api/scratchr2/user?u=${username}`);
        const json = await res.json();
        return json;
    } catch(ex) {
        console.log(ex)
        return {
            id: 0
        }
    }
}

export async function fetchWithCORS(url, init = {}) {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, init);
    const oldResText = res.text.bind(res);
    Object.assign(res, {
        text: async () => {
            const text = await oldResText();
            return JSON.parse(text).contents;
        },
        json: async () => {
            return res.text().then(JSON.parse);
        }
    });

    return res;
}