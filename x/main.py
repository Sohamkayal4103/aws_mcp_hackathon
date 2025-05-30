import os
import time
from dotenv import load_dotenv
from minmax.generate_video import invoke_video_generation, query_video_generation, fetch_video_result, call_tts_stream, collect_audio, merge_video_audio
from x.tweet import post_tweet

# Load environment variables
load_dotenv()

# Fake campaign data
fake_campaigns = [
    # {
    #     "id": 1,
    #     "title": "Summer Sale Promo",
    #     "description": "Get ready for our big summer sale! Up to 50% off on all items. #SummerSale",
    #     "tweeted": False
    # },
    # {
    #     "id": 2,
    #     "title": "New Product Launch",
    #     "description": "Introducing our latest gadget! Innovative, sleek, and powerful. #NewRelease",
    #     "tweeted": False
    # },
    {
        "id": 3,
        "title": "Holiday Special",
        "description": "Celebrate the holidays with our exclusive deals! Limited time offer. #HolidayDeals",
        "tweeted": False
    }
]

def fetch_untweeted_campaigns_fake():
    """Return campaigns from fake data where tweeted is False."""
    return [campaign for campaign in fake_campaigns if not campaign["tweeted"]]

def update_campaign_status_fake(campaign_id, post_unique_id):
    """Update tweeted status and post_unique_id in fake data."""
    for campaign in fake_campaigns:
        if campaign["id"] == campaign_id:
            campaign["tweeted"] = True
            campaign["post_unique_id"] = post_unique_id
            print(f"Updated fake campaign {campaign_id} with post_unique_id {post_unique_id}")
            break

def generate_video_with_description(description, video_output="output.mp4", audio_output="output_audio.mp3", final_output="final_output.mp4"):
    """Generate video and audio based on description and merge them."""
    try:
        # Step 1: Generate Video
        print("Generating video...")
        task_id = invoke_video_generation()  # Assumes video_prompt is set in generate_video.py
        while True:
            time.sleep(10)
            file_id, status = query_video_generation(task_id)
            if file_id:
                fetch_video_result(file_id)
                print("Video generated successfully")
                break
            elif status in ["Fail", "Unknown"]:
                raise Exception("Video generation failed or unknown status")

        # Step 2: Generate Audio
        print("Generating audio...")
        audio_chunk_iterator = call_tts_stream(description)
        audio = collect_audio(audio_chunk_iterator)
        with open(audio_output, 'wb') as file:
            file.write(audio)
        print(f"Audio saved to {audio_output}")

        # Step 3: Merge Video and Audio
        merge_video_audio(video_output, audio_output, final_output)
        print(f"Final video saved to {final_output}")
        return final_output
    except Exception as e:
        print(f"Error in video generation: {str(e)}")
        raise

def main():
    """Main loop to process untweeted campaigns from fake data and post to Twitter."""
    try:
        while True:
            print("Checking for untweeted campaigns...")
            campaigns = fetch_untweeted_campaigns_fake()

            if not campaigns:
                print("No untweeted campaigns found. Sleeping for 10 seconds...")
            else:
                for campaign in campaigns:
                    campaign_id = campaign['id']
                    description = campaign['description']
                    print(f"Processing campaign {campaign_id} with description: {description}")

                    # Generate video with description as audio input
                    final_video_path = generate_video_with_description(description)

                    # Post tweet with description as text and generated video
                    print(f"Posting tweet for campaign {campaign_id}...")
                    tweet_result = post_tweet(text=description, video_path=final_video_path)

                    if "error" in tweet_result:
                        print(f"Failed to post tweet for campaign {campaign_id}: {tweet_result['error']}")
                        continue

                    # Update campaign status with tweet ID
                    post_unique_id = tweet_result['response']['id']
                    update_campaign_status_fake(campaign_id, post_unique_id)
                    print(f"Successfully processed campaign {campaign_id}")

            # Sleep for 10 seconds before next iteration
            time.sleep(10)

    except KeyboardInterrupt:
        print("Script terminated by user")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    main()