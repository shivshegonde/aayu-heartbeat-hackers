// Unified Single-Port Hosting Entrypoint for GharCare
const path = require('path');
const fs = require('fs');

// 1. Load Environment Variables (.env can be in root or in backend/)
const possibleEnvPaths = [
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, 'backend/.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    try {
      require('dotenv').config({ path: envPath });
      break;
    } catch (e) {
      // Continue searching
    }
  }
}
try {
  require('dotenv').config();
} catch (e) {
  // dotenv optional if environment variables provided by DirectAdmin/CloudLinux
}

// 2. Resolve Server Port (DirectAdmin / Passenger automatically injects process.env.PORT)
const PORT = process.env.PORT || 4003;
process.env.PORT = String(PORT);

console.log(`[GharCare Host] Initializing unified application on port ${PORT}...`);

// 3. Locate Compiled Backend Server
const possibleBackendPaths = [
  path.resolve(__dirname, 'backend/dist/server.js'),
  path.resolve(__dirname, 'dist/server.js'),
  path.resolve(process.cwd(), 'backend/dist/server.js'),
  path.resolve(process.cwd(), 'dist/server.js'),
];

let backendDistServer = possibleBackendPaths.find((p) => fs.existsSync(p));

if (!backendDistServer) {
  console.log('[GharCare Host] Backend build missing. Checking if build can be generated...');
  try {
    const { execSync } = require('child_process');
    if (fs.existsSync(path.resolve(__dirname, 'backend/package.json'))) {
      execSync('npm --prefix backend run build', { stdio: 'inherit' });
    } else if (fs.existsSync(path.resolve(__dirname, 'package.json'))) {
      execSync('npm run build', { stdio: 'inherit' });
    }
    backendDistServer = possibleBackendPaths.find((p) => fs.existsSync(p));
  } catch (err) {
    console.warn('[GharCare Host] Automated build skipped:', err.message);
  }
}

// 4. Verify Frontend Bundle
const possibleFrontendPaths = [
  path.resolve(__dirname, 'frontend/dist/index.html'),
  path.resolve(__dirname, '../frontend/dist/index.html'),
  path.resolve(process.cwd(), 'frontend/dist/index.html'),
  path.resolve(process.cwd(), '../frontend/dist/index.html'),
];

const frontendDistIndex = possibleFrontendPaths.find((p) => fs.existsSync(p));
if (frontendDistIndex) {
  console.log(`[GharCare Host] Static frontend verified at: ${path.dirname(frontendDistIndex)}`);
} else {
  console.warn('[GharCare Host] Warning: frontend/dist/index.html not found. Please ensure frontend/dist is uploaded.');
}

// 5. Boot Up the Unified Server (Express serves API + Static Frontend + Presentation Deck)
if (backendDistServer && fs.existsSync(backendDistServer)) {
  console.log(`[GharCare Host] Loading backend from: ${backendDistServer}`);
  require(backendDistServer);
} else {
  console.error('[GharCare Host] Critical: Could not find compiled backend (dist/server.js).');
  console.error('Please run "npm run build" locally before uploading, or compile backend using tsc.');
  process.exit(1);
}
