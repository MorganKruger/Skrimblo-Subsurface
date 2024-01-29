import { addEntity, queryEntities } from "../lib/entity.js";
import { Position, RigidBody, Sprite } from "./components.js";

console.clear();

// Add Player
addEntity(
    new Position(0, 0),
    new RigidBody(0, 0),
    new Sprite(),
);

addEntity(
    new Position(2, 2),
    new Sprite(),
);

addEntity(
    new Position(4, 5),
    new RigidBody(0, 0),
);


const res = queryEntities(Position, RigidBody);

queryEntities(Position, RigidBody);