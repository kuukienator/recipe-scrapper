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
const getPaginatedUrl = ({ url, page }) => `${url}&page=${page}`;

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
    await page.waitFor(1000);
    const links = await page.$$eval('a + div>a', links =>
        links.map(l => l.href)
    );

    await page.close();
    return Array.from(new Set(links));
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
        'head script[data-react-helmet]',
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

    console.log('urls', urls.length);
    const rawRecipes = await Promise.all(
        urls.map(url => getRecipe({ url, browser }))
    );
    recipes = [...recipes, ...rawRecipes.map(formatRecipe)];

    const output = {
        meta: { count: recipes.length, url },
        recipes
    };
    await writeFile(
        'data/recipes-list-hello-fresh.json',
        JSON.stringify(output)
    );

    return getRecipes({ url, page: page + 1, browser, maxPages, recipes });
};

// module.exports = { getRecipes };

class HelloFreshScrapper extends AbstractScrapper {
    static async getRecipes({
        url = 'https://www.hellofresh.com/recipe-archive/search/?order=-favorites',
        recipeSelector = 'head script[data-react-helmet]',
        linkSelector = 'a + div>a',
        filename = 'data/recipes-list-hello-fresh.json',
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

    /**
     *
     * @returns {Promise<Array<string>>}
     */
    static async getRecipeLinks({ waitTime = 1000, ...options }) {
        return super.getRecipeLinks({ waitTime, ...options });
    }
}

module.exports = HelloFreshScrapper;
