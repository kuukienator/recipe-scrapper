'use strict';

const AbstractScrapper = require('./abstract-scrapper');

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
