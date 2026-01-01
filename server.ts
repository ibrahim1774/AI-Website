import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import deployHandler from './api/deploy.js';
import uploadAssetHandler from './api/upload-asset.js';
import { AssetUploader } from './lib/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase payload limit for large images
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Serve static files from dist
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// API Route
app.post('/api/deploy', async (req, res) => {
    console.log('Received deploy request');
    try {
        // Mock Vercel Request/Response objects
        // @ts-ignore
        await deployHandler(req, res);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// New Sequential Upload Endpoint
app.post('/api/upload-asset', async (req, res) => {
    console.log(`[SERVER] Received upload request. Body size: ${JSON.stringify(req.body).length} bytes`);
    try {
        await uploadAssetHandler(req as any, res as any);
    } catch (error: any) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Logging Endpoint for debugging client-side issues
app.post('/api/log', (req, res) => {
    console.log('[CLIENT LOG]', JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

// Fallback for SPA routing
app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
    🚀 Local Server Running!
    ---------------------------------------
    Frontend: http://localhost:${PORT}?debug=true
    API:      http://localhost:${PORT}/api/deploy
    ---------------------------------------
    1. Open the URL above.
    2. Generate a site.
    3. Click "Deploy Website" (or "Test Pipeline").
    `);
});
