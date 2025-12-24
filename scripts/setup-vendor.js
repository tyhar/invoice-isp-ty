import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const vendorDir = path.join(rootDir, 'vendor', 'livewire', 'livewire', 'dist');
const vendorFile = path.join(vendorDir, 'livewire.esm.js');
const publicFile = path.join(rootDir, 'public', 'vendor', 'livewire', 'livewire.esm.js');

// Create vendor directory structure if it doesn't exist
if (!fs.existsSync(vendorDir)) {
    fs.mkdirSync(vendorDir, { recursive: true });
    console.log('Created vendor directory structure');
}

// Create symlink or copy file if vendor file doesn't exist
if (!fs.existsSync(vendorFile) && fs.existsSync(publicFile)) {
    try {
        // Try symlink first (works on Unix systems)
        fs.symlinkSync(publicFile, vendorFile, 'file');
        console.log('Created symlink to public vendor file');
    } catch (error) {
        // Fallback to copy if symlink fails (Windows or permission issues)
        if (error.code === 'EEXIST' || error.code === 'EPERM') {
            fs.copyFileSync(publicFile, vendorFile);
            console.log('Copied public vendor file to vendor directory');
        } else {
            throw error;
        }
    }
} else if (fs.existsSync(vendorFile)) {
    console.log('Vendor file already exists');
} else {
    console.warn('Warning: Neither vendor nor public vendor file found');
}

