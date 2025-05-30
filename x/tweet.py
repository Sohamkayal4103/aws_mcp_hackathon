import tweepy
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def post_tweet(text, video_path=None):
    """
    Post a tweet with text and optional video.
    
    Parameters:
    - text (str): The tweet text (max 280 characters).
    - video_path (str, optional): Path to the video file.
    
    Returns:
    - dict: Response from Twitter API or error message.
    """
    try:
        # Retrieve credentials from environment variables
        api_key = os.getenv("TWITTER_API_KEY")
        api_secret = os.getenv("TWITTER_API_SECRET")
        access_token = os.getenv("TWITTER_ACCESS_TOKEN")
        access_token_secret = os.getenv("TWITTER_ACCESS_TOKEN_SECRET")
        bearer_token = os.getenv("TWITTER_BEARER_TOKEN")

        # Validate environment variables
        missing_vars = []
        if not api_key:
            missing_vars.append("TWITTER_API_KEY")
        if not api_secret:
            missing_vars.append("TWITTER_API_SECRET")
        if not access_token:
            missing_vars.append("TWITTER_ACCESS_TOKEN")
        if not access_token_secret:
            missing_vars.append("TWITTER_ACCESS_TOKEN_SECRET")
        if not bearer_token:
            missing_vars.append("TWITTER_BEARER_TOKEN")
        
        if missing_vars:
            return {
                "error": f"Missing environment variables: {', '.join(missing_vars)}. Please check your .env file."
            }

        # Log loaded credentials (for debugging, avoid logging full secrets in production)
        print("Environment variables loaded successfully:")
        print(f"TWITTER_API_KEY: {'*' * len(api_key) if api_key else 'Not set'}")
        print(f"TWITTER_API_SECRET: {'*' * len(api_secret) if api_secret else 'Not set'}")
        print(f"TWITTER_ACCESS_TOKEN: {'*' * len(access_token) if access_token else 'Not set'}")
        print(f"TWITTER_ACCESS_TOKEN_SECRET: {'*' * len(access_token_secret) if access_token_secret else 'Not set'}")
        print(f"TWITTER_BEARER_TOKEN: {'*' * len(bearer_token) if bearer_token else 'Not set'}")

        # Validate input
        if not text or len(text) > 280:
            return {"error": "Text is empty or exceeds 280 characters"}
        if video_path and not os.path.exists(video_path):
            return {"error": f"Video file not found: {video_path}"}
        
        # Authenticate with Twitter API v1.1 for media upload and v2 for posting
        auth = tweepy.OAuth1UserHandler(api_key, api_secret, access_token, access_token_secret)
        api_v1 = tweepy.API(auth, wait_on_rate_limit=True)
        
        # Verify credentials
        print("Verifying credentials...")
        user = api_v1.verify_credentials()
        print(f"Authenticated as: {user.screen_name}")
        
        client_v2 = tweepy.Client(
            bearer_token=bearer_token,
            consumer_key=api_key,
            consumer_secret=api_secret,
            access_token=access_token,
            access_token_secret=access_token_secret
        )
        
        # Upload video if provided
        media_id = None
        if video_path:
            print(f"Uploading video: {video_path}")
            media = api_v1.media_upload(filename=video_path, media_category="tweet_video", chunked=True)
            media_id = media.media_id_string
            print(f"Video uploaded, media_id: {media_id}")
        
        # Post tweet
        print("Posting tweet...")
        response = client_v2.create_tweet(text=text, media_ids=[media_id] if media_id else None)
        tweet_id = response.data['id']
        tweet_url = f"https://twitter.com/user/status/{tweet_id}"
        print(f"Tweet posted successfully! URL: {tweet_url}")
        return {"status": "success", "tweet_url": tweet_url, "response": response.data}
    
    except tweepy.TweepyException as e:
        error_details = e.response.text if e.response else str(e)
        print(f"Twitter API error details: {error_details}")
        return {"error": f"Twitter API error: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

if __name__ == "__main__":
    # Example usage
    tweet_text = "Check out this cool video! #Python #TwitterAPI"
    video_file = "./video.mp4"  # Set to None if no video
    
    result = post_tweet(text=tweet_text, video_path=video_file)
    
    print(result)