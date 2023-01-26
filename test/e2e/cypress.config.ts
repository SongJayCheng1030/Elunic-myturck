const path = require('path');
require('dotenv').config({path:  path.resolve(__dirname, '.env')})
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      config.env.URL = process.env.TURCK_URL
      config.env.USERNAME = process.env.TURCK_USERNAME
      config.env.PASSWORD = process.env.TURCK_PASSWORD

      return config;
    },
    viewportHeight: 1080,
    viewportWidth: 1920,
    screenshotOnRunFailure: true,
    video: true,
    chromeWebSecurity: false,
    supportFile: 'cypress/support/index.ts',
    retries: {
      // Configure retry attempts for `cypress run`
      runMode: 2,
      // Configure retry attempts for `cypress open`
      openMode: 0
    },
    reporter: 'cypress-qase-reporter',
    reporterOptions: {
      apiToken: process.env.QASE_TOKEN,
      projectCode: 'MTR',
      logging: true,
    },
  },
});
