import { Box, Draw, Position, RigidBody } from "./components.js";
import { addEntity, unloadScene } from "../lib/entity.js";
import { addSystem, runAllSystems } from "../lib/system.js";
import { app } from "./init-pixi.js";


import loadMainScene from "./scenes/main.scene.js";
import loadShopScene from "./scenes/shop.scene.js";

import "./systems.js";

setInterval(((main = true)=>{
    return function() {
        unloadScene();
        app.stage.removeChildren();

        main = !main;

        if (main) loadMainScene();
        else loadShopScene();
        
        app.stage.sortChildren();
    }
})(), 2000);

loadMainScene();

app.ticker.add(runAllSystems);