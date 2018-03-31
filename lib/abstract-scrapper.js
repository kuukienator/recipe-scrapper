'use strict';
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

/**
 *
 *
 * @class AbstractScrapper
 */
class AbstractScrapper {
    /**
     *
     * @param {string} url
     * @param {number} page
     * @returns {string}
     */
    static getPaginatedUrl({ url, page }) {
        return `${url}?pn=${page}`;
    }

    /**
     *
     * @param {string} recipe
     * @param {string} url
     * @returns {{url: string}}
     */
    static formatRecipe({ recipe, url }) {
        return {
            ...AbstractScrapper.parseJSON(recipe),
            ...{ url }
        };
    }

    /**
     *
     * @param {string} url
     * @param {Browser} browser
     * @param {string} selector
     * @param {number} waitTime
     * @returns {Promise<Array<string>>}
     */
    static async getRecipeLinks({ url, browser, selector, waitTime = 0 }) {
        const page = await browser.newPage();
        await page.goto(url);
        if (waitTime > 0) {
            await page.waitFor(waitTime);
        }
        const links = await page.$$eval(selector, links =>
            links.map(l => l.href)
        );

        await page.close();
        return links;
    }

    /**
     *
     * @param {string} url
     * @param {Browser} browser
     * @param {string} selector
     * @returns {Promise<{url: string, recipe:string}>}
     */
    static async getRecipe({ url, browser, selector }) {
        const page = await browser.newPage();
        await page.goto(url);
        const recipe = await page.$eval(selector, e => e.innerHTML);

        await page.close();
        return { url, recipe };
    }

    /**
     *
     * @param {string} string
     * @returns {object}
     */
    static parseJSON(string) {
        let parsed = {};
        try {
            parsed = JSON.parse(string);
        } catch (err) {
            console.error('JSON parse error');
        }
        return parsed;
    }

    /**
     *
     * @param {string} url
     * @param {number} page
     * @param {Browser} browser
     * @param {number} maxPages
     * @param {Array<object>} recipes
     * @param {string} recipeSelector
     * @param {string} linkSelector
     * @param {string} filename
     * @returns {Promise<Array<object>>}
     */
    static async getRecipes({
        url,
        page = 1,
        browser,
        maxPages,
        recipes = [],
        recipeSelector,
        linkSelector,
        filename
    }) {
        if (page > maxPages) {
            return Promise.resolve(recipes);
        }

        console.log('getRecipes:page', page);
        const urls = await this.getRecipeLinks({
            url: this.getPaginatedUrl({ url, page }),
            browser,
            selector: linkSelector
        });

        const rawRecipes = await Promise.all(
            urls.map(url =>
                this.getRecipe({ url, browser, selector: recipeSelector })
            )
        );
        recipes = [...recipes, ...rawRecipes.map(this.formatRecipe)];

        const output = { meta: { count: recipes.length, url }, recipes };
        await writeFile(filename, JSON.stringify(output));

        return this.getRecipes({
            url,
            page: page + 1,
            browser,
            maxPages,
            recipes,
            linkSelector,
            filename,
            recipeSelector
        });
    }
}

module.exports = AbstractScrapper;
