const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dtciesamk',
  api_key: '316977883714349',
  api_secret: 'iBFgLQoW3u3VARVA_j2SSCqw_Ms'
});

cloudinary.api.ping()
  .then(res => console.log('Ping success:', res))
  .catch(err => console.error('Ping error:', err.error));
