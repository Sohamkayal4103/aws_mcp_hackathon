import os
import time
import json
import requests
import subprocess
from typing import Iterator
import ffmpeg
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Video generation configuration
video_api_key = os.getenv("MINMAX_AUDIO_SECRET_KEY")
video_prompt = "Description of your video"
video_model = "T2V-01"
video_output_file = "output.mp4"

# Audio generation configuration
audio_group_id = os.getenv("MINMAX_GROUP_ID")
audio_api_key = os.getenv("MINMAX_AUDIO_SECRET_KEY")
audio_file_format = 'mp3'  # Support mp3/pcm/flac
audio_text = "The real danger is not that computers start thinking like people, but that people start thinking like computers."
audio_url = f"https://api.minimaxi.chat/v1/t2a_v2?GroupId={audio_group_id}"

# Final output
final_output_file = "final_output.mp4"

# Video Generation Functions
def invoke_video_generation() -> str:
    print("-----------------Submit video generation task-----------------")
    url = "https://api.minimaxi.chat/v1/video_generation"
    payload = json.dumps({
        "prompt": video_prompt,
        "model": video_model
    })
    headers = {
        'authorization': f'Bearer {video_api_key}',
        'content-type': 'application/json',
    }

    response = requests.post(url, headers=headers, data=payload)
    if response.status_code != 200:
        raise Exception(f"Video generation failed: {response.text}")
    task_id = response.json()['task_id']
    print(f"Video generation task submitted successfully, task ID: {task_id}")
    return task_id

def query_video_generation(task_id: str) -> tuple[str, str]:
    url = f"https://api.minimaxi.chat/v1/query/video_generation?task_id={task_id}"
    headers = {
        'authorization': f'Bearer {video_api_key}'
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Query failed: {response.text}")
    status = response.json()['status']
    if status == 'Preparing':
        print("...Preparing...")
        return "", 'Preparing'
    elif status == 'Queueing':
        print("...In the queue...")
        return "", 'Queueing'
    elif status == 'Processing':
        print("...Generating...")
        return "", 'Processing'
    elif status == 'Success':
        return response.json()['file_id'], "Finished"
    elif status == 'Fail':
        return "", "Fail"
    else:
        return "", "Unknown"

def fetch_video_result(file_id: str):
    print("---------------Video generated successfully, downloading now---------------")
    url = f"https://api.minimaxi.chat/v1/files/retrieve?file_id={file_id}"
    headers = {
        'authorization': f'Bearer {video_api_key}',
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"File retrieval failed: {response.text}")

    download_url = response.json()['file']['download_url']
    print(f"Video download link: {download_url}")
    with open(video_output_file, 'wb') as f:
        f.write(requests.get(download_url).content)
    print(f"The video has been downloaded to: {os.getcwd()}/{video_output_file}")

# Audio Generation Functions
def build_tts_stream_headers() -> dict:
    return {
        'accept': 'application/json, text/plain, */*',
        'content-type': 'application/json',
        'authorization': f"Bearer {audio_api_key}",
    }

def build_tts_stream_body(text: str) -> str:
    return json.dumps({
        "model": "speech-02-turbo",
        "text": text,
        "stream": True,
        "voice_setting": {
            "voice_id": "male-qn-qingse",
            "speed": 1.0,
            "vol": 1.0,
            "pitch": 0
        },
        "audio_setting": {
            "sample_rate": 32000,
            "bitrate": 128000,
            "format": audio_file_format,
            "channel": 1
        }
    })

def collect_audio(audio_stream: Iterator[bytes]) -> bytes:
    audio = b""
    for chunk in audio_stream:
        if chunk:
            try:
                decoded_hex = bytes.fromhex(chunk)
                audio += decoded_hex
            except ValueError:
                print("Invalid hex data in audio chunk")
                continue
    return audio

# Merge Video and Audio
def merge_video_audio(video_file: str, audio_file: str, output_file: str):
    print("---------------Merging video and audio---------------")
    try:
        # Verify input files exist
        if not os.path.exists(video_file):
            raise FileNotFoundError(f"Video file not found: {video_file}")
        if not os.path.exists(audio_file):
            raise FileNotFoundError(f"Audio file not found: {audio_file}")

        # Check file sizes
        video_size = os.path.getsize(video_file)
        audio_size = os.path.getsize(audio_file)
        print(f"Video file size: {video_size} bytes")
        print(f"Audio file size: {audio_size} bytes")
        if video_size == 0:
            raise ValueError("Video file is empty")
        if audio_size == 0:
            raise ValueError("Audio file is empty")

        # Probe input files to check their validity
        try:
            video_probe = ffmpeg.probe(video_file)
            audio_probe = ffmpeg.probe(audio_file)
            print(f"Video probe: {video_probe['format']}")
            print(f"Audio probe: {audio_probe['format']}")
        except ffmpeg.Error as probe_error:
            raise Exception(f"Failed to probe input files: {probe_error.stderr.decode()}")

        # Merge video and audio
        video_stream = ffmpeg.input(video_file)
        audio_stream = ffmpeg.input(audio_file)
        output = ffmpeg.output(
            video_stream, audio_stream, output_file,
            vcodec='copy', acodec='aac', strict='experimental',
            shortest=None  # Use shortest stream to avoid duration mismatch
        )
        print(f"Running FFmpeg command: {output.compile()}")
        ffmpeg.run(output, overwrite_output=True)
        print(f"Final video with audio saved to: {os.getcwd()}/{output_file}")

    except ffmpeg.Error as e:
        error_message = e.stderr.decode('utf-8') if e.stderr else str(e)
        raise Exception(f"FFmpeg error: {error_message}")
    except Exception as e:
        raise Exception(f"Merging failed: {str(e)}")

def call_tts_stream(text: str) -> Iterator[bytes]:
    tts_url = audio_url
    tts_headers = build_tts_stream_headers()
    tts_body = build_tts_stream_body(text)

    response = requests.request("POST", tts_url, stream=True, headers=tts_headers, data=tts_body)
    for chunk in (response.raw):
        if chunk:
            if chunk[:5] == b'data:':
                data = json.loads(chunk[5:])
                if "data" in data and "extra_info" not in data:
                    if "audio" in data["data"]:
                        audio = data["data"]['audio']
                        yield audio

if __name__ == '__main__':
    try:
        # Step 1: Generate Video
        print("Starting video generation...")
        task_id = invoke_video_generation()
        print("-----------------Video generation task submitted-----------------")
        while True:
            time.sleep(10)
            file_id, status = query_video_generation(task_id)
            if file_id:
                fetch_video_result(file_id)
                print("---------------Video generation successful---------------")
                break
            elif status in ["Fail", "Unknown"]:
                raise Exception("Video generation failed or unknown status")

        # Step 2: Generate Audio
        print("Starting audio generation...")
        audio_chunk_iterator = call_tts_stream(audio_text)
        audio = collect_audio(audio_chunk_iterator)
        audio_file_name = f"output_total_{int(time.time())}.{audio_file_format}"
        with open(audio_file_name, 'wb') as file:
            file.write(audio)
        audio_file_name = "output_total_1748635101.mp3"
        print(f"Audio saved to: {os.getcwd()}/{audio_file_name}")

        # Step 3: Merge Video and Audio
        merge_video_audio(video_output_file, audio_file_name, final_output_file)
        print("---------------Process completed successfully---------------")

    except Exception as e:
        print(f"---------------Error occurred: {str(e)}---------------")