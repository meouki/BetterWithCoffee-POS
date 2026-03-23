const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TunnelManager {
    constructor() {
        this.process = null;
        this.url = null;
        this.status = 'inactive';
        this.retryCount = 0;
        this.maxRetries = 10;
    }

    start(localPort = 5000) {
        if (this.process) {
            console.log('Tunnel already running.');
            return;
        }

        console.log('🚀 Starting Cloudflare Quick Tunnel...');
        this.status = 'starting';
        this.url = null;

        // Try 'cloudflared' first, but also check common Windows install path as a fallback
        const cmd = 'cloudflared';
        const winPath = 'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe';
        const winPath2 = 'C:\\Program Files\\cloudflared\\cloudflared.exe';
        
        let exec = cmd;
        if (process.platform === 'win32') {
            if (fs.existsSync(winPath)) exec = winPath;
            else if (fs.existsSync(winPath2)) exec = winPath2;
        }

        // Start cloudflared in a child process
        this.process = spawn(exec, ['tunnel', '--url', `http://localhost:${localPort}`]);

        // Cloudflared outputs the URL to stderr
        this.process.stderr.on('data', (data) => {
            const output = data.toString();
            
            // Look for the trycloudflare.com URL
            const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
            if (urlMatch) {
                this.url = urlMatch[0];
                this.status = 'active';
                console.log(`\n☁️  Cloud Access Enabled: ${this.url}\n`);
            }

            // Log output for debugging if needed (optionally write to a file)
            // fs.appendFileSync('tunnel.log', output);
        });

        this.process.on('close', (code) => {
            console.log(`Cloudflare tunnel process exited with code ${code}`);
            this.process = null;
            this.url = null;
            this.status = 'inactive';

            // Auto-restart logic
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying tunnel connection (${this.retryCount}/${this.maxRetries})...`);
                setTimeout(() => this.start(localPort), 5000 * this.retryCount);
            }
        });

        this.process.on('error', (err) => {
            console.error('Failed to start Cloudflare Tunnel:', err.message);
            this.status = 'error';
            if (err.code === 'ENOENT') {
                console.log('TIP: It looks like "cloudflared" is not installed. Install it via winget.');
            }
        });
    }

    getStatus() {
        return {
            status: this.status,
            url: this.url
        };
    }

    stop() {
        if (this.process) {
            this.process.kill();
            this.process = null;
            this.status = 'inactive';
            this.url = null;
        }
    }
}

module.exports = new TunnelManager();
