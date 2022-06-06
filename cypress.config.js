// import { defineConfig } from 'cypress';
// import * as plugins from ;

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  fixturesFolder: 'test/cypress/fixtures',
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./test/cypress/plugins')(on, config)
    },
    baseUrl: 'http://localhost:9002',
    specPattern: 'test/cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'test/cypress/support/index.js',
  }
})
