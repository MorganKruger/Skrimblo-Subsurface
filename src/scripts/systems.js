import { addSystem } from "../lib/system.js";
import { Box, Draw, Position, RigidBody } from "./components.js";


// Moving positions with rigidbodies
addSystem([Position, RigidBody], (pos, rb)=>{
    pos.x += rb.vx;
    pos.y += rb.vy;

    /// Need to implement
    // rb.movePosition(pos);
});

addSystem([Position, Draw], (pos, draw)=>{
    draw.sprite.x = pos.x;
    draw.sprite.y = pos.y;
});

addSystem([Box, Draw], (box, draw)=>{
    draw.sprite.width = box.width;
    draw.sprite.height = box.height;
});
