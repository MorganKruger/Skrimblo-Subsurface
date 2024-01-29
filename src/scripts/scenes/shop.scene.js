import { addEntity } from "../../lib/entity.js";
import { Box, Draw, Position, RigidBody } from "../components.js";
const PIXI = require("pixi.js");

export default function () {
    // Player Entity
    addEntity(
        new Position(50, 50),
        new RigidBody(0.1, 0.1),
        new Box(50, 50),
        new Draw(PIXI.Sprite.from("./assets/exit_rug.png")).zIndex(2),
    );
}