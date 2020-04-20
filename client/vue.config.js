"use strict";
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require("path");
// const PrerenderSPAPlugin = require('prerender-spa-plugin')
// const PuppeteerRenderer = PrerenderSPAPlugin.PuppeteerRenderer
// const JSDOMRenderer = require('@prerenderer/renderer-jsdom')

module.exports = {
    // configureWebpack: {
    //     plugins: [
    //         new PrerenderSPAPlugin({
    //             // Required - The path to the webpack-outputted app to prerender.
    //             staticDir: path.join(__dirname, 'dist'),
    //             // Required - Routes to render.
    //             routes: [ '/', '/about', '/faq' ],
    //             renderer: new PuppeteerRenderer()
    //           })
    //     ]
    // },
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000/',
                ws: true,
                changeOrigin: true
            },
            '/ws': {
                target: 'http://localhost:1234/',
                ws: true,
                changeOrigin: true
            },
        }
    }



};
