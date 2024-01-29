import * as sys from "./systems.js";
import { Position, Move, Gravity, PlayerControlled, Name, TerminalVelocity, Draw, Friction, RigidBody, Mine, Player, Direction, TileMap, GridTile, Pickaxe, Interactable} from "./components.js";
import * as g from "./config.js";
const PIXI = require("pixi.js");

let currentId = 0;
export let gameState = "Main";

const app = new PIXI.Application({ width: 400, height: 1300 });
document.body.appendChild(app.view);

const world = new PIXI.Container();
// world.sortDirty = true;

const shop = new PIXI.Container();
// shop.sortDirty = true;

const home = new PIXI.Container();
// home.sortDirty = true;

let currentScene;
let cameraX = 0;
let cameraY = 0;
const viewWidth = 300;
const viewHeight = 250;
const SCREEN_WIDTH = app.screen.width;
const SCREEN_HEIGHT = app.screen.height;

// background
let backgroundTexture = PIXI.Texture.from("./assets/background_dirt.png");
let backgroundSprite = new PIXI.TilingSprite(backgroundTexture, SCREEN_WIDTH, SCREEN_HEIGHT);
// let backgroundSprite = new PIXI.TilingSprite(backgroundTexture, viewWidth, viewHeight);
app.stage.addChild(backgroundSprite);

// interaction icon
export const INTERACTION_ICON = PIXI.Sprite.from("./assets/interaction_icon.png");
INTERACTION_ICON.anchor.set(.5, .5);
INTERACTION_ICON.zIndex = 3;
world.addChild(INTERACTION_ICON);

// tile overlay
export const TILE_OVERLAY = PIXI.Sprite.from("./assets/tile_overlay.png");
TILE_OVERLAY.zIndex = 3;
world.addChild(TILE_OVERLAY);

export let WORLD_TILES = TileMap.withSquares(g.TILE_SIZE, g.WORLD_WIDTH, g.WORLD_DEPTH);

let componentLists = { // object of arrays(by component name) of id's
  TileMap: [],
  Position: [],
  GridPosition: [],
  Friction: [],
  Gravity: [],
  PlayerControlled: [],
  TerminalVelocity: [],
  Draw: [],
  Move: [],
  RigidBody: [],
  Click: [],
  Name: [],
  Player: [],
  Mine: [],
  Direction: [],
  Pickaxe: [],
  GridTile: [],
  Interactable: [],
};

/////////////////////////////
// #region Event Listeners //
/////////////////////////////
const keys = {};
onkeydown = (event) => {
  
  // prevent screen from scrolling (but allow "ctrl + shift + i")
  if (event.key == " ") event.preventDefault();

  keys[event.key.toLowerCase()] = true;
}
onkeyup = event => keys[event.key.toLowerCase()] = false;
// #endregion  

///////////////////////
// #region Functions //
///////////////////////

export const validateInteraction = (entityId, interactable) => {
  switch (interactable.constraint) {
    case "Door":
      const positionInstance = getComponent(entityId, "Position");
      const structureSprite = getComponent(interactable.id, "Draw").sprite;
      const playerControlInstance = getComponent(entityId, "PlayerControlled");
      
      if (!pointIsInsideSprite(positionInstance, structureSprite)) {
        playerControlInstance.interaction = null;
        return;
      }
      
      playerControlInstance.interaction = interactable.action;
      showInteractionIcon(positionInstance);
      break;
  }
}

export const attemptInteraction = (playerControlInstance) => {  
  switch (playerControlInstance.interaction) {
    case "Main":
      setGameState("Main");
      break;
    case "Shop":
      setGameState("Shop");
      break;
    case "Home":
      setGameState("Home");
      break;
  }
}

export const showInteractionIcon = (positionInstance) => {
  INTERACTION_ICON.x = positionInstance.posX + (getComponent(positionInstance.id, "RigidBody").width / 2);
  INTERACTION_ICON.y = positionInstance.posY - 15;
  INTERACTION_ICON.visible = true;
}

export const moveTileOverlay = (gridLocation) => {
  TILE_OVERLAY.x = getRawXFromGrid(gridLocation);
  TILE_OVERLAY.y = getRawYFromGrid(gridLocation)
}

export const fetchPickaxeForPlayer = (playerId) => {
  const playerPositionInstance = getComponent(playerId, "Position");
  const playerDrawInstance = getComponent(playerId, "Draw");
  const playerRigidInstance = getComponent(playerId, "RigidBody");
  const playerMoveInstance = getComponent(playerId, "Move");
  const playerDirectionInstance = getComponent(playerId, "Direction");

  const pickDrawInstance = getComponent(getComponent(playerId, "Player").pickaxeId, "Draw"); 
  
  pickDrawInstance.sprite.scale.x = playerDrawInstance.sprite.scale.x;
  
  if (playerMoveInstance.veloX != 0) {
    pickDrawInstance.sprite.x = playerDirectionInstance.right ?
      playerPositionInstance.posX + playerRigidInstance.width :
      playerPositionInstance.posX;
  }

  pickDrawInstance.sprite.y = playerPositionInstance.posY + playerRigidInstance.height / 2;
}

export const getComponent = (id, componentType) => {
  return componentLists[componentType].find(instance => instance.id === id);
}
export const getComponentWithRawCoordinates = (rawX, rawY, componentType) => {
  const positionInstance = componentLists["Position"].find(instance => instance.posX == rawX && instance.posY == rawY);

  return getComponent(positionInstance.id, componentType);
}
export const getComponentWithGridPos = (gridPos, componentType) => {
  const positionInstance = componentLists["Position"].find(instance => getCoordinateGridPos(instance.posX, instance.posY) == gridPos);

  return getComponent(positionInstance.id, componentType);
}

/** @returns {any[]} */
export const query = (firstArray, ...arrays) => { // with list of components, return list of matching components -- inner join all component lists provided
  if (arrays.length <= 1) return componentLists[firstArray];

  const filteredIds = componentLists.reduce((accumulator, currentComponentArray) => {
    return accumulator.filter(id => currentComponentArray.includes(id)); // breaks at 400 entities?
  });
  return filteredIds;
}

const createEntity = (...components) => { // foreach class instance(component) provided, add the entity ID to their ID list (componentLists)
  components.forEach(c => {
    componentLists[c.constructor.name].push(c);
  });
  currentId += 1;
}

export const getRawXFromGrid = (gridIndex) => {
  return gridIndex % g.WORLD_WIDTH * g.TILE_SIZE;
}
export const getRawYFromGrid = (gridIndex) => {
  return Math.floor(gridIndex / g.WORLD_WIDTH) * g.TILE_SIZE;
}

export const getComponentGridPos = (positionInstance) => {
  const y = Math.floor(positionInstance.posY / g.TILE_SIZE);
  const x = Math.floor(positionInstance.posX / g.TILE_SIZE);

  return x + (y * g.WORLD_WIDTH);
}
export const getCoordinateGridPos = (rawX, rawY) => {
  const x = Math.floor(rawX / g.TILE_SIZE);
  const y = Math.floor(rawY / g.TILE_SIZE);

  return x + (y * g.WORLD_WIDTH);
}

export const pointIsInsideSprite = (positionInstance, sprite) => {
  const x = positionInstance.posX;
  const y = positionInstance.posY;

  return x > sprite.x && x < sprite.x + sprite.width && y < sprite.y && y > sprite.y - sprite.height
}

const generateMine = () => {
  for (let i = g.MINE_GRID_Y; i < g.MINE_GRID_Y + g.MINE_DEPTH; i++) { // rows
    for (let j = g.MINE_GRID_X; j < g.MINE_GRID_X + g.MINE_WIDTH; j++) { // columns
      
      const depth = (i - g.MINE_GRID_Y) / g.MINE_DEPTH;
      
      // random material based on depth
      let material = Math.random() < g.AMBIENT_MATERIAL_CHANCE || i < g.MINE_ORE_BUFFER ?
        g.TILE_AMBIENT_MATERIAL[ arrayAtIndexUsingCustomCurve(Object.keys(g.TILE_AMBIENT_MATERIAL), depth, range(.4, .6)) ] :
        g.TILE_VALUABLE_MATERIAL[ arrayAtIndexUsingCustomCurve(Object.keys(g.TILE_VALUABLE_MATERIAL), depth, range(-.25, 1)) ];

      WORLD_TILES.tiles[j + (i * g.WORLD_WIDTH)] = material.typeId;

      let positionInstance = new Position(j * g.TILE_SIZE, i * g.TILE_SIZE);
      createEntity(
        new Draw(PIXI.Sprite.from(material.imgPath), 0, 0, world),
        new Mine(material.value, material.toughness),
        positionInstance,
        // new GridTile(positionInstance),
      );
    } // end columns
  } // end rows
}

const clampToViewX = (x) => {
  if (x < viewWidth / 2) {
    return viewWidth / 2;
  } else if (x > SCREEN_WIDTH - viewWidth / 2) {
    return SCREEN_WIDTH - viewWidth / 2;
  } 

  return x;
}

const clampToViewY = (y) => {
  if (y < viewHeight / 2) {
    return viewHeight / 2;
  } else if (y > SCREEN_HEIGHT - viewHeight / 2) {
    return SCREEN_HEIGHT - viewHeight / 2;
  } 

  return y;
}

const updateCamera = (x, y) => {
  // cameraX = clampToViewX(-x);
  // cameraY = clampToViewY(-y);
console.log("camara update")
  cameraX = -x;
  cameraY = -y;

  app.stage.x = cameraX;
  app.stage.y = cameraY;
}

const focusTile = (id) => {
  const directionInstance = getComponent(id, "Direction");
  const positionInstance = getComponent(id, "Position");
  const playerControlInstance = getComponent(id, "PlayerControlled")
  const rigidInstance = getComponent(id, "RigidBody")

  const originTile = getCoordinateGridPos(positionInstance.posX + rigidInstance.width / 2, positionInstance.posY + rigidInstance.height / 2);
  
  const tileUp = originTile - g.WORLD_WIDTH;
  const tileDown = originTile + g.WORLD_WIDTH;
  const tileRight = (originTile + 1) % g.WORLD_WIDTH ? originTile + 1 : undefined;
  const tileLeft = (originTile - 1) % g.WORLD_WIDTH ? originTile - 1 : undefined;

  if (keys["w"] && WORLD_TILES.tiles[tileUp]) {
    playerControlInstance.focusedTile = tileUp;
    TILE_OVERLAY.visible = true;
  } else if (keys["s"] && WORLD_TILES.tiles[tileDown]) {
    playerControlInstance.focusedTile = tileDown;
    TILE_OVERLAY.visible = true;
  } else if (directionInstance.right && WORLD_TILES.tiles[tileRight]) {
    playerControlInstance.focusedTile = tileRight;
    TILE_OVERLAY.visible = true;
  } else if (!directionInstance.right && WORLD_TILES.tiles[tileLeft]) {
    playerControlInstance.focusedTile = tileLeft;
    TILE_OVERLAY.visible = true;
  } else {
    TILE_OVERLAY.visible = false;
  }

  if (isset(playerControlInstance.focusedTile)) {
    moveTileOverlay(playerControlInstance.focusedTile);
  }
}

const setupWorldScene = () => {
  // place player's pick
  const pickaxeSprite = new Draw(PIXI.Sprite.from(g.PICKAXES[g.STARTER_PICK_TYPE].imgPath), 0, 1);
  pickaxeSprite.sprite.zIndex = 2;
  createEntity(
    new Pickaxe(g.PICKAXES[g.STARTER_PICK_TYPE], g.STARTER_PICK_TYPE),
    pickaxeSprite,
  );
  
  // build player
  const playerSprite = new Draw(PIXI.Sprite.from("./assets/skrim.png"), .5, .5);
  playerSprite.sprite.zIndex = 2;
  createEntity(
    new Position(g.OVERWORLD_SPAWN_X, g.OVERWORLD_SPAWN_Y), 
    new Move(Math.random() * 200 - 100, -50),
    new Gravity(),
    new PlayerControlled(65, 90, 5.5 * g.METER),
    new Friction(.95, g.METER),
    new TerminalVelocity(g.GRAVITY * 6),
    playerSprite,
    RigidBody.withoutSprite(8, 12),
    new Player(0, query("Pickaxe")[0].id), // ASSUMING ONLY ONE PICKAXE INSTANCE 
    new Direction()
  );
  
  // setup mine
  generateMine();
  
  // setup house
  let houseSprite = new Draw(PIXI.Sprite.from("./assets/sprite_house.png"), 0, 1, world);
  houseSprite.sprite.zIndex = 1;
  createEntity(
    new Position(((g.MINE_GRID_X + 12) * g.TILE_SIZE), (g.MINE_GRID_Y * g.TILE_SIZE)),
    houseSprite,
    new Interactable("Door", "Home")
  );
  
  // setup shop
  let shopSprite = new Draw(PIXI.Sprite.from("./assets/sprite_shop.png"), 0, 1, world);
  shopSprite.sprite.zIndex = 1;
  createEntity(
    new Position(((g.MINE_GRID_X + 1) * g.TILE_SIZE), (g.MINE_GRID_Y * g.TILE_SIZE)),
    shopSprite,
    new Interactable("Door", "Shop")
  );
  
  placeSprites();
  world.sortChildren();
}

const setupShopScene = () => {  

  // setup floor 
  const shopFloorTexture = PIXI.Texture.from("./assets/brown_floor.png");
  const shopFloorSprite = new PIXI.TilingSprite(shopFloorTexture, 250, 250);
  shopFloorSprite.anchor.x = .5;
  shopFloorSprite.anchor.y = .5;
  shopFloorSprite.x = viewWidth / 2;
  shopFloorSprite.y = viewHeight / 2;
  shop.addChild(shopFloorSprite);
  
  const grayFloorTexture = PIXI.Texture.from("./assets/gray_floor.png");

  const merchantFloorSprite = new PIXI.TilingSprite(grayFloorTexture, 40, 60);
  const merchantFloorDrawInstance = new Draw(merchantFloorSprite, 0, 1, shop);
  // setup merchant floor
  createEntity(
    new Position(2, viewHeight - 10), 
    // new Draw(PIXI.Sprite.from("./assets/gray_floor.png"), 0, 1, shop),
    merchantFloorDrawInstance,
    new Interactable("Merchant", "Main")
  );
  // setup forge floor
  const forgeFloorSprite = new PIXI.TilingSprite(grayFloorTexture, 40, 60);
  const forgeDrawInstance = new Draw(forgeFloorSprite, 0, 0, shop);
  createEntity(
    new Position(viewWidth - 2 - forgeDrawInstance.width, viewHeight - 10), 
    // new Draw(PIXI.Sprite.from("./assets/gray_floor.png"), 1, 1, shop),
    forgeDrawInstance,
    new Interactable("Door", "Main")
  );
  
  // setup exit rug
  createEntity(
    new Position(viewWidth / 2, viewHeight - 2), 
    new Draw(PIXI.Sprite.from("./assets/exit_rug.png"), .5, 1, shop),
    new Interactable("Door", "Main")
  );
  // const displayCaseTexture = PIXI.Texture.from("./assets/pick_display_case.png");
  // const displayCaseSprite = PIXI.TilingSprite(displayCaseTexture, 40, 60);

  // setup display case
  const displayCase = PIXI.Sprite.from("./assets/pick_display_case.png");
  displayCase.anchor.x = .5;
  displayCase.setParent(shop);
  // displayCase.
  // createEntity(
  //   new Position(viewWidth / 2, viewHeight), 
  //   new Draw(PIXI.Sprite.from("./assets/exit_rug.png"), .5, 1, shop),
  // );
  
  placeSprites();
  shop.sortChildren();
}

const placeSprites = () => {
  componentLists["Draw"].forEach(drawInstance => {
    const positionInstance = getComponent(drawInstance.id, "Position");
  
    if (positionInstance) {
      drawInstance.sprite.x = positionInstance.posX;
      drawInstance.sprite.y = positionInstance.posY;
    }
  });
}

const setPlayerInteraction = (playerInstance) => {
  const interactables = query("Interactable");
  for (let i = 0; i < interactables.length; i++) {
    validateInteraction(playerInstance.id, interactables[i]);
    
    if (getComponent(playerInstance.id, "PlayerControlled").interaction) break;
  }
}

const tick = (deltaInSeconds) => {

  // default to false each tick
  INTERACTION_ICON.visible = false;
  console.log(gameState)

  switch (gameState) {
    case "Main":

      // calculate movements
      query("Gravity").forEach(entity => sys.doGravity(entity, deltaInSeconds));
      query("PlayerControlled").forEach(entity => sys.doPlayerControl(entity, deltaInSeconds));

      // display movements
      query("Move").forEach(entity => sys.move(entity, deltaInSeconds));  
    
      // handle various player behavior
      query("Player").forEach(playerEntity => { 
        setPlayerInteraction(playerEntity);

        const pos = getComponent(playerEntity.id, "Position");
        updateCamera(pos.posX - viewWidth / 2, pos.posY - viewHeight / 2 - 50);

        focusTile(playerEntity.id);
      });

      updateEntitySprites();

      console.log("MAIN TICK")

      break;
    case "Shop" || "Home":

      // calculate movements
      query("PlayerControlled").forEach(controlledEntity => sys.doPlayerControl(controlledEntity, deltaInSeconds));

      // display movements
      query("Move").forEach(mobEntity => sys.move(mobEntity, deltaInSeconds));
    
      // handle various player behavior
      query("Player").forEach(playerEntity => {
        setPlayerInteraction(playerEntity);
      });

      updateEntitySprites();

      break;
    case "Home":
      break;
  }
}

const updateEntitySprites = () => {
  query("Draw").forEach(drawInstance => {
    const positionInstance = getComponent(drawInstance.id, "Position");
    
    // draw mob
    if (positionInstance) {

      const rigidInstance = getComponent(drawInstance.id, "RigidBody");
      if (rigidInstance) {
        drawInstance.sprite.x = positionInstance.posX + rigidInstance.width * drawInstance.sprite.anchor.x;
        drawInstance.sprite.y = positionInstance.posY + rigidInstance.height * drawInstance.sprite.anchor.y;
      } else {
        drawInstance.sprite.x = positionInstance.posX;
        drawInstance.sprite.y = positionInstance.posY;
      }

      // mirror the sprite to face the direction of motion 
      const directionInstance = getComponent(drawInstance.id, "Direction");
      if (directionInstance) {
        
        const moveInstance = getComponent(drawInstance.id, "Move");
        if (moveInstance && moveInstance.veloX != 0) {
          directionInstance.right = moveInstance.veloX > 0;

          drawInstance.sprite.scale.x = directionInstance.right ? drawInstance.sprite.scale.x = 1 : drawInstance.sprite.scale.x = -1;
        }

      }
    }
  })
}

const setGameState = (newState) => {
  const oldState = gameState;
  gameState = newState;
  console.log('new state: ' + gameState)
  const positionInstance = getComponent(query("Player")[0].id, "Position"); // ASSUMING ONLY ONE PLAYER INSTANCE
  const rigidInstance = getComponent(positionInstance.id, "RigidBody"); // ASSUMING ONLY ONE PLAYER INSTANCE
  const moveInstance = getComponent(positionInstance.id, "Move"); // ASSUMING ONLY ONE PLAYER INSTANCE

  // hang old scene
  switch (oldState) {
    case "Main":
      app.stage.removeChild(world);
      break;
    case "Shop":
      app.stage.removeChild(shop);
      break;
    case "Home":
      app.stage.removeChild(home);
      break;
  }

  moveInstance.veloX = 0;
  moveInstance.veloY = 0;

  // load new scene
  switch (newState) {
    case "Main":
      currentScene = world;
      
      positionInstance.posX = g.OVERWORLD_SPAWN_X;
      positionInstance.posY = g.OVERWORLD_SPAWN_Y;

      break;
    case "Shop":
      currentScene = shop;

      console.log("SHOP CAM")
      updateCamera(viewWidth / 2, viewHeight / 2);

      positionInstance.posX = viewWidth / 2;
      positionInstance.posY = viewHeight - rigidInstance.height;

      break;
    case "Home":
      currentScene = home;
      break;
    default:
      gameState = oldState;
  }

  app.stage.addChild(currentScene);
  app.stage.sortChildren();
}

// #endregion

//////////////////////////////
// #region Helper Functions // // not specific to this app
//////////////////////////////

export const range = (min, max) => {
  return Math.random() * (max - min) + min;
}

export const arrayAtIndexUsingCustomCurve = (array, depth, range, deviation) => {
  deviation = deviation || 1;
  const meanIndex = depth * (array.length - 1);

  let index = Math.min(array.length - 1, Math.round(meanIndex - deviation + range * deviation * 2));

  if (index >= array.length) {
    index = array.length - 1;
  } else if (index < 0) {
    index = 0;
  }

  return array[index]
}

export const isset = (any) => {
  return any != null && any != undefined;
}
// #endregion

setupWorldScene();
setupShopScene();
// setupHomeScene();

setGameState("Main");

////////////////////////////
// #region Animation Loop //
////////////////////////////
app.ticker.add((delta) => {
  const deltaInSeconds = delta / 20; // time between frames / frame rate (or something; frame rate seems inaccurate)
  
  tick(deltaInSeconds);

  // app.renderer.render(camera.stage);
  app.renderer.render(app.stage);
});
// #endregion

export { SCREEN_WIDTH, SCREEN_HEIGHT, keys, currentId, app, componentLists, world }