const fs = require('fs');
const { join } = require('path');
const sioPorts = require('../sio-ports.json');

const FRONTEND_PROXY_CONF_JSON = `shopfloorio-frontends/proxy.conf.json`;
const SHARED_SERVICE_LIST_FILE = `shared/nestjs/src/services/shared-service.ts`;

// ---
// This helper script generates the Angular proxy.conf.json
// located in the root of every registered frontend project
// containing the correct dependencies as well as other inter-service
// specific config files
// ---

// =====
// Generate the proxy.conf.json files
// =====
console.log(`Updateing proxy.conf.json file ...`);

// List all backends
let payload = {};
sioPorts
  .filter(pp => pp.type === "SERVICE")
  .forEach(p => {
    payload = {
      ...payload,
      ...{
        // Forward requests to the path of the (micro-)service
        // to the actual service
        [`${p.path + (p.path.endsWith('/') ? '' : '/')}*`]: {
          "target": `http://localhost:${p.port}`,
          "secure": false,
          // "logLevel": "debug",
          "logLevel": "info",
          // Handle CORS issues on local
          "changeOrigin": true,
          "pathRewrite": {
            // Trim away the "sub-path" of the backend
            [`^${p.path + (p.path.endsWith('/') ? '' : '/')}`]: "/"
          }
        }
      }
    };
  })

// Write the files
const fileName = join(__dirname, '..', '..', FRONTEND_PROXY_CONF_JSON);
console.log(`--> Writing file '${fileName}' ...`);
fs.writeFileSync(fileName, JSON.stringify(payload, null, 2));

// =====
// Generate the shared service info file
// =====
function updateLocalSharedServiceMap() {
  const fileName = join(__dirname, '..', '..', SHARED_SERVICE_LIST_FILE);
  let content = fs.readFileSync(fileName).toString();

  // Generate the data statement
  const portMap = {};
  sioPorts
    .filter(p => p.type === "SERVICE")
    .forEach(s => {
      (s.envVars || []).forEach(envVar => {
        portMap[envVar] = `http://host.docker.internal:${s.port}`;
      })
    });

  const mapStmt = [
    `/* DO NOT CHANGE! AUTOMATICALLY GENERATED! */ `,
    `export const LOCAL_PORT_MAP = ${JSON.stringify(portMap, null, 2)};`,
  ].join('');

  const idx = content.indexOf(`export const LOCAL_PORT_MAP`);
  if (idx < 0) {
    content = [
      content,
      mapStmt,
      ''
    ].join('\n');
  } else {
    content = content.substring(0, content.lastIndexOf('\n', idx)) + content.substring(content.indexOf('};', idx)+3);
    content = [
      content,
      mapStmt,
      ''
    ].join('\n');
  }

  console.log(`--> Writing file '${fileName}' ...`);
  fs.writeFileSync(fileName, content);
}

function updateDocsSwaggerReferences() {
  const fileName = join(__dirname, '..', '..', 'docs/src/pages/known-api-docs.js');

  const map = sioPorts
    .filter(p => p.type === "SERVICE")
    .map(s => ({
      tag: s.name,
      name: s.displayName,
      url: {
        dev: `http://localhost:${s.port}/api/docs-json/`,
        prod: `${s.path}api/docs-json/`,
      }
    }));

    
    console.log(`--> Writing file '${fileName}' ...`);
    fs.writeFileSync(fileName, `module.exports = ${JSON.stringify(map, null, 2)};`);
}

updateLocalSharedServiceMap();
updateDocsSwaggerReferences();

console.log('Done');
