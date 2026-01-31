import os
from datetime import datetime
from zoneinfo import ZoneInfo
import asyncio
from playwright.async_api import async_playwright

USERNAME = "bulpeter@cassiaschools.org"
PASSWORD = "Megot@bs22"
SERVER_FILES_URL = "https://topeaglerservers.com/host/server/1c657b1d-9b9e-456f-8d88-4f5c661b80d3/files?path=logs"
LOCAL_FOLDER = "logs_backups/"

os.makedirs(LOCAL_FOLDER, exist_ok=True)

async def download_latest_log():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Go to login page
        await page.goto("https://topeaglerservers.com/host/login")
        await page.fill('input[name="email"]', USERNAME)
        await page.fill('input[name="password"]', PASSWORD)
        await page.click('button[type="submit"]')
        await page.wait_for_load_state('networkidle')

        # Go to files page
        await page.goto(SERVER_FILES_URL)
        await page.wait_for_load_state('networkidle')

        # Find the first log file in the table (adjust selector if needed)
        log_link = await page.query_selector('//a[contains(@href, ".log")]')
        if log_link:
            download_url = await log_link.get_attribute('href')
            today = datetime.now(ZoneInfo("America/Boise")).strftime("%Y-%m-%d")
            local_file = os.path.join(LOCAL_FOLDER, f"latest_{today}.log")

            # Actually download the file
            content = await page.request.get(download_url)
            with open(local_file, "wb") as f:
                f.write(await content.body())

            print(f"[{today}] Downloaded latest log successfully!")
        else:
            print("No log file found on the page.")

        await browser.close()


# Run at 4:45 Idaho time
import schedule
import time as t

def job_wrapper():
    now = datetime.now(ZoneInfo("America/Boise"))
    if now.hour == 17 and now.minute == 00:
        asyncio.run(download_latest_log())

print("Daily log downloader running...")
while True:
    job_wrapper()
    t.sleep(60)
