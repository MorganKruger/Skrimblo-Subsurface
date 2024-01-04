import { currentId, getComponentGridPos, app } from "./renderer.js";

// Defines coordinate screen-position for entity
// requires: (none)
export class Position {
  constructor (x, y) {
    this.id = currentId;
    this.posX = x || 0;
    this.posY = y || 0;
  }
}

// Defines world grid-space for tiles
// requires: (none)
// note: may be used as singlet
export class TileMap {
  constructor (tileWidth, tileHeight, gridWidth, gridHeight) {
    this.id = currentId;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.tiles = new Uint8Array(this.gridWidth * this.gridHeight); // 1D list of 2D world tiles by type
  }
  static withSquares(sideLength, gridWidth, gridHeight) {
    return new TileMap(sideLength, sideLength, gridWidth, gridHeight);
  }
}

// Entity is evaluated each tick for movement
// requires: Position
export class Move {
  constructor (veloX, veloY) {
    this.id = currentId;
    this.veloX = veloX || 0;
    this.veloY = veloY || 0; 
  }
}

// Adds downwards velocity to entity's "Move" component each tick
// requires: Move
export class Gravity {
  constructor () {
    this.id = currentId;
  }
}

// Entity will be evaluated for player-input actions
// requires: Move, Position, Player
export class PlayerControlled {
  constructor (jumpPower, sprintGain, sprintMax) {
    this.id = currentId;
    this.grounded;
    this.interaction;
    this.jumpPower = jumpPower;
    this.sprintGain = sprintGain;
    this.sprintMax = sprintMax;
    this.focusedTile;
  }
}

// Displays text by cursor when entity sprite is hovered over
// requires: Draw
export class Name {
  constructor (name) {
    this.id = currentId;
    this.name = name;
  }
}

// Sets limit to falling movement speed
// requires: Position, Move, Gravity
export class TerminalVelocity {
  constructor (max) {
    this.id = currentId;
    this.max = max;
  }
}

// Handles PIXI.js sprite
// requires: (none)
export class Draw {
  constructor (sprite, anchorX, anchorY, stage) {
    this.id = currentId;
    this.sprite = sprite;
    this.sprite.anchor.set(anchorX, anchorY);
    
    if (stage) {
      stage.addChild(this.sprite);
    } else {
      app.stage.addChild(this.sprite);
    }
  }
}

// Allows arbitrary events triggered by player interaction while character is located on this entity sprite
// requires: Draw
export class Interactable {
  constructor (constraint, action) {
    this.id = currentId;
    this.constraint = constraint;
    this.action = action;
  }
}

// Reduces movement speed of entity each frame
// requires: Move
export class Friction {
  constructor (friction, shortStop) {
    this.id = currentId;
    this.friction = friction;
    this.shortStop = shortStop;
  }
}

// Defines entity's phsyical edges for collision
// requires: [Draw]
export class RigidBody {
  constructor (width, height, instanceOfDraw) { // double, double, Draw
    this.id = currentId;

    if (instanceOfDraw) {
      this.width = instanceOfDraw.sprite.width;
      this.height = instanceOfDraw.sprite.height;
    } else {
      this.width = width;
      this.height = height;
    }
  }
  static withSprite(instanceOfDraw) {
    return new RigidBody(null, null, instanceOfDraw);
  }
  static withoutSprite(width, height) {
    return new RigidBody(width, height, null);
  }
}

// Allows entity to be mined by player
// requires: Position
export class Mine {
  constructor (value, toughness) {
    this.id = currentId;
    this.value = value;
    this.toughness = toughness;
  }
}

// Entity is evaluated as a player character
// requires: Position, Move, Draw, Pickaxe
export class Player {
  constructor (wallet, pickaxeId) {
    this.id = currentId;
    this.wallet = wallet || 0;
    this.pickaxeId = pickaxeId;
  }
}

// Entity sprite follows player sprite and this data is used when associated player executes mining action
// requires: Position, Draw
export class Pickaxe {
  constructor (pickaxeObject, type) {
    this.id = currentId;
    this.type = type;
    this.toughness = pickaxeObject.toughness;
    this.strength = pickaxeObject.strength;
  }
}

// ... (Entity will be counted and placed within the world grid?)
// requires: Position
export class GridTile {
  constructor (positionInstance) {
    this.id = currentId;
    this.gridPos = getComponentGridPos(positionInstance);
  }
}

// Used to track horizontal direction when entity is not moving
// requires: Position, Move
export class Direction {
  constructor (right) {
    this.id = currentId;
    this.right = right;
  }
}