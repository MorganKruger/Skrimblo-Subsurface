const PIXI = require("pixi.js");

// Create a PixiJS Application
export const app = new PIXI.Application({
    width: 800,
    height: 600,
    background: 0xFFFFFF,
});

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);