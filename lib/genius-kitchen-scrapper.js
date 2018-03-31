'use strict';

const AbstractScrapper = require('./abstract-scrapper');

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
