'use strict';
const puppeteer = require('puppeteer');

const GeniusKitchenScrapper = require('./lib/genius-kitchen-scrapper');
const HelloFreshScrapper = require('./lib/hello-fresh-scrapper');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const recipes = await HelloFreshScrapper.getRecipes({
        browser,
        maxPages: 1
    });

    console.log(`Scrapped ${recipes.length} recipes`);

    await browser.close();
})();
