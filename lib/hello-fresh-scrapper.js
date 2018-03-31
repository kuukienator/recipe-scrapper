'use strict';

const AbstractScrapper = require('./abstract-scrapper');

/**
 *
 *
 * @class HelloFreshScrapper
 * @extends {AbstractScrapper}
 */
class HelloFreshScrapper extends AbstractScrapper {
    /**
     *
     * @param {string} url
     * @param {string} recipeSelector
     * @param {string} linkSelector
     * @param {string} filename
     * @param {object} options
     * @returns {Promise<Array<Object>>}
     */
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

    /**
     *
     * @param {string} url
     * @param {number} page
     * @returns {string}
     */
    static getPaginatedUrl({ url, page }) {
        return `${url}&page=${page}`;
    }
}

module.exports = HelloFreshScrapper;
