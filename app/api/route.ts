import { NextResponse } from "next/server";
import ytch from 'yt-channel-info'
//@ts-ignore
import getYtId from '@gonetone/get-youtube-id-by-url'
import { Innertube } from 'youtubei.js';
import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: 'YOUR_API_KEY',
});

const openAi = new OpenAI({ apiKey: "YOUR_API_KEY" })

export async function POST(request: Request) {

    const { channelUrl } = await request.json()

    const youtube = await Innertube.create();

    try {

        const payload = {
            channelId: await getYtId.channelId(channelUrl),
            sortBy: 'newest' as "newest" | "oldest" | "popular" | undefined,
            channelIdType: 0
        }


        const [channel, channelVideos] = await Promise.all([
            youtube.getChannel(payload.channelId),
            ytch.getChannelVideos(payload),
        ])

        const channelDescription = (await channel.getAbout() as any).metadata?.description

        const videoInfos = await Promise.all(channelVideos.items.map(video => {
            return youtube.getBasicInfo(video.videoId)
        }))



        const prompt = `
  Come up with 3 ideas for my next YouTube video for my YouTube channel given my channel description and previous videos.
  
  For each idea, give me a video title and description.
  
  Output your response in JSON. Do not include a preamble or any other text other than JSON.
  
  <channel-description>
  "${channelDescription}"
  </channel-description>
  
  <previous-videos>
  ${videoInfos.map(videoInfo => {
            return `
    <previous-video>
      <title>
         ${videoInfo.basic_info.title}
      </title>
      <description>
         ${videoInfo.basic_info.short_description?.replaceAll('\n', '\n       ')}
      </description>
    </previous-video>
    `
        }).join('\n')}
  </previous-videos>
  
  <output-format>
  Output your response in JSON in the following format...
  [
    {
      "title": <string>,
      "description": <string>
    },
    ...
  ]
  </output-format>
  
  `

        const result = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            temperature: 0.8,
            max_tokens: 4000,
            messages: [
                {
                    role: 'user',
                    content: prompt
                },
            ],
        });

        const output = result.content[0].text;

        const suggestions = JSON.parse(output ?? "")


        // 
        // Uncomment below if you want to use OpenAI instead of Claude
        //

        // const result = await openAi.chat.completions.create({
        //     model: "gpt-3.5-turbo-1106",
        //     temperature: 0.8,
        //     messages: [{
        //         role: "user",
        //         content: prompt

        //     }],

        // });

        // const output = result.choices[0]?.message.content?.replace('```json', '').replace('```', '')

        return NextResponse.json({ suggestions }, { status: 200 });




    }
    catch (e: any) {
        console.error("Error", e)
        return NextResponse.json({}, { status: 500 })
    }
}

