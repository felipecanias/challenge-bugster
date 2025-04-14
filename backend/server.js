import express from 'express';
import { chromium } from 'playwright';
import cors from 'cors';

let browser;
let page;
let screenshotInterval;

const app = express();
const PORT = 3001;

// Stream configuration
const STREAM_CONFIG = {
  quality: 90,    // JPEG quality (0-100)
  fps: 15,        // Frames per second
  width: 1280,    // Capture width
  height: 720     // Capture height
};

app.use(cors());
app.use(express.json());

let clients = []; // Store active stream clients

async function launchBrowser(url) {
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();
    await page.setViewportSize({ 
      width: STREAM_CONFIG.width, 
      height: STREAM_CONFIG.height 
    });

    // Use provided URL or default to Google
    const targetUrl = url || 'https://www.google.com';
    await page.goto(targetUrl);

    startScreenshotStream();
    return true;
  } catch (error) {
    console.error('Error launching browser:', error);
    return false;
  }
}

function startScreenshotStream() {
  if (screenshotInterval) {
    clearInterval(screenshotInterval);
  }

  const intervalMs = 1000 / STREAM_CONFIG.fps;

  screenshotInterval = setInterval(async () => {
    try {
      if (page) {
        const screenshot = await page.screenshot({ 
          type: 'jpeg', 
          quality: STREAM_CONFIG.quality,
          clip: {
            x: 0,
            y: 0,
            width: STREAM_CONFIG.width,
            height: STREAM_CONFIG.height
          }
        });
        const frameHeader = `--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${screenshot.length}\r\n\r\n`;
        clients.forEach((res) => {
          res.write(frameHeader);
          res.write(screenshot);
          res.write('\r\n');
        });
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  }, intervalMs);
}

app.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache',
    'Connection': 'close',
    'Pragma': 'no-cache',
  });
  clients.push(res);

  req.on('close', () => {
    clients = clients.filter((client) => client !== res);
  });
});

app.get('/open', async (req, res) => {
  const { url } = req.query;
  const success = await launchBrowser(url);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, error: 'Error opening browser' });
  }
});

app.get('/close', async (req, res) => {
  try {
    if (screenshotInterval) {
      clearInterval(screenshotInterval);
      screenshotInterval = null;
    }
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
    }
    clients.forEach(client => client.end());
    clients = [];
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/execute', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ 
        success: false, 
        error: 'Command is required' 
      });
    }

    if (!page) {
      return res.status(400).json({ 
        success: false, 
        error: 'Browser is not open' 
      });
    }

    // Execute Playwright command
    const result = await eval(`(async () => {
      try {
        ${command}
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    })()`);

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Stream server running at http://localhost:${PORT}`);
});