const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};
console.log('Using config:', config);
cloudinary.config(config);

async function testUpload() {
  try {
    const usage = await cloudinary.api.usage();
    console.log('--- CLOUDINARY USAGE ---');
    console.log(`Storage: ${(usage.storage.usage / 1024 / 1024).toFixed(2)} MB / ${(usage.storage.limit / 1024 / 1024).toFixed(2)} MB (${usage.storage.used_percent}%)`);
    console.log(`Bandwidth: ${(usage.bandwidth.usage / 1024 / 1024).toFixed(2)} MB / ${(usage.bandwidth.limit / 1024 / 1024).toFixed(2)} MB (${usage.bandwidth.used_percent}%)`);
    console.log(`Requests: ${usage.requests.usage} / ${usage.requests.limit} (${usage.requests.used_percent}%)`);
    console.log('------------------------');

  } catch (error) {
    console.error('API Error:', error.message || error);
  }
}

testUpload();
