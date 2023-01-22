// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import Client from 'twitter-api-sdk'
import twitterConfig from '@/config/twitter.config';

const client = new Client(process.env.TWITTER_BEARER_TOKEN);

type TwitterRequestParams = {
    days: string
}

export type GenericPost = {
    origin: Origin
    url: string
    title: string
    content: string
    image?: string
    reactions?: Reaction[]
    author: {
      name: string
      avatar?: string
      url?: string
    }
    date: Date
  }
  
export enum Origin {
GitHub = 'GITHUB',
Slack = 'SLACK',
Twitter = 'TWITTER',
}

type Reaction = {
icon: string
numInteractions: number
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GenericPost[]>,
) {
    let posts: GenericPost[] = [];
    
    let { user } = twitterConfig;
    let { days } = req.query as TwitterRequestParams;

    // remove random quotations that are added
    user = user.replaceAll("\"", "")
    days = days.replaceAll("\"", "")

    // configure tweet request
    const user_id = (await client.users.findUserByUsername(user)).data?.id || "";
    
    const days_time = parseInt(days);
    const tweets_since_date = new Date();
    tweets_since_date.setDate(tweets_since_date.getDate() - days_time);

    // make tweet request
    const raw_tweets_response = await client.tweets.usersIdTweets(user_id, {
        exclude: ["replies", "retweets"],
        start_time: tweets_since_date.toISOString(),
        expansions: ["author_id"],
        "tweet.fields": ["id", "author_id", "text", "public_metrics", "created_at"],
        "user.fields": ["profile_image_url"],
    });

    const raw_tweets_data = raw_tweets_response.data;
    const raw_tweets_user = raw_tweets_response.includes;

    let profile_image_url = "";
    raw_tweets_user?.users?.forEach(user => {
        profile_image_url = user.profile_image_url || "";
    })

    // convert raw tweet response to our type
    raw_tweets_data?.forEach(function (data) {
        const tweetMetrics = {
            retweet_count: data.public_metrics?.retweet_count || 0,
            reply_count: data.public_metrics?.reply_count || 0,
            like_count: data.public_metrics?.like_count || 0,
            quote_count: data.public_metrics?.quote_count || 0
        }

        const postData = {
            origin: Origin.Twitter,
            url: `https://twitter.com/${user}/status/${data.id}`,
            title: "",
            content: data.text || "",
            reactions: [
                { icon: "likes", numInteractions: tweetMetrics.like_count },
                { icon: "retweets", numInteractions: tweetMetrics.retweet_count },
                { icon: "quotes", numInteractions: tweetMetrics.quote_count },
                { icon: "replies", numInteractions: tweetMetrics.reply_count }
            ],
            author: {
                name: user,
                avatar: profile_image_url,
                url: `https://twitter.com/${user}`
            },
            date: new Date(Date.parse(data.created_at || ""))
        }
        posts.push(postData)
    })

    res.status(200).json(posts)
}
