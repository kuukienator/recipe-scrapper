'use strict';

const AbstractScrapper = require('./abstract-scrapper');

/**
 *
 *
 * @class GeniusKitchenScrapper
 * @extends {AbstractScrapper}
 */
class GeniusKitchenScrapper extends AbstractScrapper {
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

    /**
     *
     * @param {string} url
     * @param {number} page
     * @returns {string}
     */
    static getPaginatedUrl({ url, page }) {
        return `${url}?pn=${page}`;
    }
}

module.exports = GeniusKitchenScrapper;
