const new_posts = require('./new-posts');

const { QuickDB } = require("quick.db");
const db = new QuickDB();

async function autoSendPosts(client) {

    setInterval(async () => {

        console.log(Date.now() + ' | Checking for new posts...');

        const data = await db.all();

        channels = [];

        for (const [key, value] of Object.entries(data)) {
            if(value.id == "lastPost") continue;

            if (value.value.feedChannel) {
                channels.push(value.value.feedChannel);
            };
        };
        
        new_posts.checkNewPosts("no_guild", client, channels);
    }, 20000);
};

module.exports = { autoSendPosts };