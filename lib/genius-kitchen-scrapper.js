const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

const AbstractScrapper = require('./abstract-scrapper');

/**
 *
 * @param {string} url
 * @param {number} page
 * @returns {string}
 */
const getPaginatedUrl = ({ url, page }) => `${url}?pn=${page}`;

/**
 *
 * @param {string} recipe
 * @param {string} url
 * @returns {{url: string}}
 */
const formatRecipe = ({ recipe, url }) => ({
    ...parseJSON(recipe),
    ...{ url }
});

/**
 *
 * @param {string} url
 * @param {Browser} browser
 * @returns {Promise<Array<string>>}
 */
const getRecipeLinks = async ({ url, browser }) => {
    const page = await browser.newPage();
    await page.goto(url);
    const links = await page.$$eval(
        '.container-sm-md:not(.featured-tiles) .fd-recipe .fd-img-wrap a',
        links => links.map(l => l.href)
    );

    await page.close();
    return links;
};

/**
 *
 * @param {string} url
 * @param {Browser} browser
 * @returns {Promise<{url: string, recipe:string}>}
 */
const getRecipe = async ({ url, browser }) => {
    const page = await browser.newPage();
    await page.goto(url);
    const recipe = await page.$eval(
        '.fd-page-feed>script:nth-child(1)',
        e => e.innerHTML
    );

    await page.close();
    return { url, recipe };
};

/**
 *
 * @param {string} string
 * @returns {object}
 */
const parseJSON = string => {
    let parsed = {};
    try {
        parsed = JSON.parse(string);
    } catch (err) {
        console.error('JSON parse error');
    }
    return parsed;
};

/**
 *
 * @param {string} url
 * @param {number} page
 * @param {Browser} browser
 * @param {number} maxPages
 * @param {Array<object>} recipes
 * @returns {Promise<Array<object>>}
 */
const getRecipes = async ({ url, page, browser, maxPages, recipes = [] }) => {
    if (page > maxPages) {
        return Promise.resolve(recipes);
    }

    console.log('getRecipes:page', page);
    const urls = await getRecipeLinks({
        url: getPaginatedUrl({ url, page }),
        browser
    });
    const rawRecipes = await Promise.all(
        urls.map(url => getRecipe({ url, browser }))
    );
    recipes = [...recipes, ...rawRecipes.map(formatRecipe)];

    const output = { meta: { count: recipes.length, url }, recipes };
    await writeFile(
        'data/recipes-list-genius-kitchen.json',
        JSON.stringify(output)
    );

    return getRecipes({ url, page: page + 1, browser, maxPages, recipes });
};

// module.exports = { getRecipes };

class GeniusKitchenScrapper extends AbstractScrapper {
    static async getRecipes({
        url = 'http://www.geniuskitchen.com/recipe',
        recipeSelector = '.fd-page-feed>script:nth-child(1)',
        linkSelector = '.container-sm-md:not(.featured-tiles) .fd-recipe .fd-img-wrap a',
        filename = 'data/recipes-list-genius-kitchen.json',
        ...options
    }) {
        return super.getRecipes({
            url,
            recipeSelector,
            linkSelector,
            filename,
            ...options
        });
    }
}

module.exports = GeniusKitchenScrapper;
