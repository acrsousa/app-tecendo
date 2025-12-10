// Generates env.js at build time using Netlify environment variables.
const fs = require('fs');

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing SUPABASE_URL and/or SUPABASE_KEY environment variables.');
}

const envConfig = {
  SUPABASE_URL,
  SUPABASE_KEY,
};

const banner = '// File auto-generated during build. Do not edit or commit.\n';
const fileBody = `${banner}window.__ENV = ${JSON.stringify(envConfig, null, 2)};\n`;

fs.writeFileSync('env.js', fileBody, 'utf8');
console.log('env.js generated successfully.');
