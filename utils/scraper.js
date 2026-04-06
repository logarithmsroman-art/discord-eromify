const puppeteer = require('puppeteer');

module.exports = {
    async verifyBio(platform, handle, expectedCode) {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            
            // Set a realistic user agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

            let url = '';
            if (platform === 'tiktok') url = `https://www.tiktok.com/@${handle}`;
            else if (platform === 'instagram') url = `https://www.instagram.com/${handle}/`;
            else if (platform === 'youtube') url = `https://www.youtube.com/@${handle}/about`;
            else return { success: false, message: 'Unsupported platform' };

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Extract bio content based on platform
            let bioText = '';
            if (platform === 'tiktok') {
                bioText = await page.$eval('[data-e2e="user-bio"]', el => el.innerText).catch(() => '');
            } else if (platform === 'instagram') {
                // Instagram often requires login for full profiles, might need a more advanced scraping strategy or an API
                // For now, we attempt to find the bio text in the meta description if direct scraping is blocked
                bioText = await page.$eval('meta[name="description"]', el => el.content).catch(() => '');
            } else if (platform === 'youtube') {
                bioText = await page.content(); // YouTube about page is complex, searching the whole body for the code
            }

            if (bioText.includes(expectedCode)) {
                return { success: true };
            } else {
                return { success: false, message: 'Code not found in bio' };
            }

        } catch (error) {
            console.error(`Scraping Error (${platform}):`, error);
            return { success: false, message: 'Error accessing profile' };
        } finally {
            if (browser) await browser.close();
        }
    }
};
