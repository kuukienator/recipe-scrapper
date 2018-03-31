'use strict';
const puppeteer = require('puppeteer');

const GeniusKitchenScrapper = require('./lib/genius-kitchen-scrapper');
const HelloFreshScrapper = require('./lib/hello-fresh-scrapper');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    await HelloFreshScrapper.getRecipes({ browser, maxPages: 5 });
    await GeniusKitchenScrapper.getRecipes({ browser, maxPages: 5 });

    console.log('Done scrapping');
    await browser.close();
})();
