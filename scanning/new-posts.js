config = require('../config.json');
const { EmbedBuilder, ChannelType, Message, messageLink } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function truncate(str, n) {
    /* Truncate a string */
    return (str.length > n) ? str.slice(0, n - 1) : str;
};

function sleep(ms) {
    /* Sleep function */
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function postData(post) {
    /* Get the post data */

    // Get the post data
    const postData = await fetch(`https://www.reddit.com/${post}.json`)
        .then(response => response.json())
        .then(data => data[0].data.children[0].data);

    // Return the post data
    return postData;
};

async function getPosts() {
    /* Get the posts */

    // Get the posts
    const postsIdData = await fetch(`https://www.reddit.com/r/${config.subreddit}/new.json?limit=${config.limit}`)
        .then(response => response.json())
        .then(data => data.data.children.map(post => post.data.id));

    const postsTimeData = await fetch(`https://www.reddit.com/r/${config.subreddit}/new.json?limit=${config.limit}`)
        .then(response => response.json())
        .then(data => data.data.children.map(post => post.data.created));

    final = postsIdData.map((id, index) => ({ id, time: postsTimeData[index] }));

    // Return the posts
    return final
};

async function newPosts(lastPost) {
    /* Get the new posts */

    // Get the posts
    const posts = await getPosts();

    // Get the new posts
    const allNewPosts = posts.filter(post => post.time > lastPost);

    // Return the new posts
    return allNewPosts;
};

async function checkNewPosts(guildID, client, channelsArray) {
    /* Check for new posts */
    const lastPost = await db.get("lastPost");

    // Get the new posts
    const newPostsArray = await newPosts(lastPost.time);

    // If there is a new post
    if (newPostsArray.length > 0) {

        console.log(`${newPostsArray.length} new post(s) found`);

        // For each new post
        for (let i = 0; i < newPostsArray.length; i++) {
            // Get the post
            const post = newPostsArray.reverse()[i];

            // Get the post data
            const data = await postData(post.id);

            // Create the embed
            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setAuthor({ name: data.author })
                .setColor(config.colors.default)
                .setDescription(data.selftext.length > 0 ? (data.selftext.length > 3000 ? truncate(data.selftext, 3000) : data.selftext) : "No description.")
                .setThumbnail(!["default", "nsfw", "self"].includes(data.thumbnail) ? data.thumbnail : "https://www.redditinc.com/assets/images/site/reddit-logo.png")
                .setURL(`https://www.reddit.com/${data.permalink}`)
                .addFields({ name: "Upvote ratio", value: `${data.upvote_ratio}`, inline: true }, { name: "Score", value: `${data.score}`, inline: true }, { name: "Comments", value: `${data.num_comments}`, inline: true })
                .addFields({ name: "URL", value: data.url, inline: true })
                .addFields({ name: "+18", value: data.over_18 ? "Yes" : "No", inline: true }, { name: "Created at", value: new Date(data.created_utc * 1000).toLocaleString(), inline: true })
                .setFooter({ text: `${config.embed.footer}` });

            console.log("Sending message to channels...");

            if (guildID != "no_guild") {
                // Get the feed channel
                const feedChannel = await db.get(`${guildID}.feedChannel`);

                // Get the channel
                const channel = await client.channels.fetch(feedChannel);

                // Send the embed
                await channel.send({ embeds: [embed] });
            } else {
                for (const channel of channelsArray) {
                    try {

                        console.log("Sending message to channel " + channel);
                        // Get the channel
                        await client.channels.fetch(channel).then(async (channelToSend) => {
                            // Send the embed
                            await channelToSend.send({ embeds: [embed] }).then(message => {
                                if(channelToSend.type === 5) {
                                    message.crosspost();
                                };
                                
                            });
                        });
                        
                        await sleep(config.sleep);
                    } catch (error) {
                        console.log(error);
                    };
                };
            };

            //TODO : si salon annonce poster message dans salon annonce

            // Set the last post
            // await db.set("lastPost", post);
        };
    };
};

module.exports = { checkNewPosts, newPosts };