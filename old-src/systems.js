import * as g from "./config.js";
import { isset, query, keys, SCREEN_WIDTH, SCREEN_HEIGHT, componentLists, getComponent, getComponentGridPos, 
  WORLD_TILES, getRawXFromGrid, getRawYFromGrid, getComponentWithGridPos, getCoordinateGridPos, fetchPickaxeForPlayer, 
  INTERACTION_ICON, pointIsInsideSprite, attemptInteraction, gameState } from "./renderer.js";

export const doGravity = (gravityInstance, secondsPassed) => {
  const moveInstance = getComponent(gravityInstance.id, "Move");
  const terminalInstance = getComponent(gravityInstance.id, "TerminalVelocity");

  const changeInRate = g.GRAVITY * secondsPassed;

  if (terminalInstance) { 
    if (moveInstance.veloY == terminalInstance.max) return;

    if (Math.abs(moveInstance.veloY) + changeInRate > terminalInstance.max) {
      moveInstance.veloY == terminalInstance.max;
      return;
    }  
  } else {
    throw new Error(`TerminalVelocity (id: ${gravityInstance.id}) does not exist`);
  }

  moveInstance.veloY += changeInRate;
}

export const doPlayerControl = (specificInstance, secondsPassed) => {
  const frictionInstance = getComponent(specificInstance.id, "Friction");
  const moveInstance = getComponent(specificInstance.id, "Move");
  const positionInstance = getComponent(specificInstance.id, "Position");
  const playerControlInstance = getComponent(specificInstance.id, "PlayerControlled");

  switch (gameState) {
    case ("Main"):
    
      if (keys["a"] || keys["d"]) { // move horizontal
    
        if (keys["a"] && moveInstance.veloX > -specificInstance.sprintMax) {
          moveInstance.veloX -= specificInstance.sprintGain * secondsPassed;
        }
    
        if (keys["d"] && moveInstance.veloX < specificInstance.sprintMax) {
          moveInstance.veloX += specificInstance.sprintGain * secondsPassed;
        }
    
      } else if (frictionInstance) { // doFriction if not actively moving
        moveInstance.veloX *= 1 - (frictionInstance.friction * secondsPassed);
    
        if (Math.abs(moveInstance.veloX) < g.METER) {
          moveInstance.veloX = 0;
        }
      }
    
      if (keys["e"]) { // interact
        keys["e"] = false;

        // interaction gets set and then immediately replaced by null from another check
        if (isset(playerControlInstance.interaction)) {
          attemptInteraction(playerControlInstance); 
        }
      } else if (keys["q"]) {
        keys["q"] = false;
        playerDig(playerControlInstance.focusedTile);
      }
      
      if (keys[" "]) { // jump
        keys[" "] = false;
    
        const mobGridPos = getComponentGridPos(positionInstance);
        const floorGridPos = mobGridPos + g.WORLD_WIDTH;
        if (!WORLD_TILES.tiles[floorGridPos]) return;
        
        const floorPositionInstance = getComponentWithGridPos(mobGridPos, "Position");
        if (!floorPositionInstance) return;
        
        if ((getRawYFromGrid(floorGridPos) - g.TILE_SIZE) - positionInstance.posY < g.JUMP_BUFFER) {
          moveInstance.veloY = -specificInstance.jumpPower;
        }
      }
      break;

    case "Shop" || "Home":
    
      if (keys["a"] || keys["d"]) { // move horizontal
        if (keys["a"] && moveInstance.veloX > -specificInstance.sprintMax) {
          moveInstance.veloX -= specificInstance.sprintGain * secondsPassed;
        }
    
        if (keys["d"] && moveInstance.veloX < specificInstance.sprintMax) {
          moveInstance.veloX += specificInstance.sprintGain * secondsPassed;
        }
      } else if (frictionInstance) { // doFriction if not actively moving
        moveInstance.veloX *= 1 - (frictionInstance.friction * secondsPassed);
    
        if (Math.abs(moveInstance.veloX) < frictionInstance.shortStop) {
          moveInstance.veloX = 0;
        }
      }

      if (keys["w"] || keys["s"]) { // move vertical
        if (keys["w"] && moveInstance.veloY > -specificInstance.sprintMax) {
          moveInstance.veloY -= specificInstance.sprintGain * secondsPassed;
        }
    
        if (keys["s"] && moveInstance.veloY < specificInstance.sprintMax) {
          moveInstance.veloY += specificInstance.sprintGain * secondsPassed;
        }
      } else if (frictionInstance) { // doFriction if not actively moving
        moveInstance.veloY *= 1 - (frictionInstance.friction * secondsPassed);
    
        if (Math.abs(moveInstance.veloY) < frictionInstance.shortStop) {
          moveInstance.veloY = 0;
        }
      }

      if (keys["e"]) { // interact
        keys["e"] = false
    
        if (isset(playerControlInstance.interaction)) {
          attemptInteraction(playerControlInstance); 
        }
      }
      break;
  }
  
};

export const move = (moveInstance, secondsPassed) => { 
  const xStop = moveInstance.veloX === 0;
  const yStop = moveInstance.veloY === 0;

  if (xStop && yStop) return;

  // moving object data
  const positionInstance = getComponent(moveInstance.id, "Position");
  const rigidInstance = getComponent(moveInstance.id, "RigidBody");
  const drawInstance = getComponent(moveInstance.id, "Draw");
  const playerInstance = getComponent(moveInstance.id, "Player");
  //
  const mobLeftEdge = positionInstance.posX;
  const mobRightEdge = positionInstance.posX + rigidInstance.width;
  const mobBottomEdge = positionInstance.posY + rigidInstance.height;
  const mobTopEdge = positionInstance.posY;
  //
  const deltaX = moveInstance.veloX * secondsPassed;
  const deltaY = moveInstance.veloY * secondsPassed; 
  const movingRight = moveInstance.veloX > 0;
  const movingDown = moveInstance.veloY > 0;

  switch (gameState) {
    case "Main":
      // grid data 
      const gridPos = getComponentGridPos(positionInstance);
      
      // handle x-axis movement
      if (mobRightEdge + deltaX > SCREEN_WIDTH) { // beyond right wall
        moveInstance.veloX = 0;
        positionInstance.posX = SCREEN_WIDTH - rigidInstance.width;
      } else if (mobLeftEdge + deltaX < 0) { // beyond left wall
        moveInstance.veloX = 0;
        positionInstance.posX = 0;
      } else { // not at world-boundary
        if (rigidInstance && !xStop) {
          const rightGridPos = (gridPos + 1) % g.WORLD_WIDTH ? gridPos + 1 : undefined;
          const leftGridPos = (gridPos - 1) % g.WORLD_WIDTH ? gridPos - 1 : undefined;
          
          if (movingRight && WORLD_TILES.tiles[rightGridPos]) {
            const tileLeftEdge = getRawXFromGrid(rightGridPos);
    
            if (mobRightEdge + deltaX > tileLeftEdge) { // collision!
              positionInstance.posX = tileLeftEdge - rigidInstance.width;
              moveInstance.veloX = 0;
            } else {
              positionInstance.posX += deltaX;
            }
            
          } else if (!movingRight && WORLD_TILES.tiles[leftGridPos]) {
            const tileRightEdge = getRawXFromGrid(leftGridPos) + g.TILE_SIZE;
    
            if (mobLeftEdge + deltaX < tileRightEdge) { // collision!
              positionInstance.posX = tileRightEdge;
              moveInstance.veloX = 0;
            } else {
              positionInstance.posX += deltaX;
            }
    
          } else {
            positionInstance.posX += deltaX;
          }
        } else { // mob not rigid
          positionInstance.posX += deltaX;
        }
        
      } 
    
      // handle y-axis movement
      if (mobBottomEdge + deltaY > SCREEN_HEIGHT) { // beyond floor
        positionInstance.posY = -SCREEN_HEIGHT;
      } else { // not at a boundary
    
        if (rigidInstance && !yStop) {
          const floorGridPos = gridPos + g.WORLD_WIDTH;
          const ceilingGridPos = gridPos - g.WORLD_WIDTH;
    
          if (movingDown && WORLD_TILES.tiles[floorGridPos]) { // approaching not air below
            const tileTopEdge = getRawYFromGrid(floorGridPos);
            const tileRightEdge = getRawXFromGrid(floorGridPos) + g.TILE_SIZE;
            const tileLeftEdge = getRawXFromGrid(floorGridPos);
    
            if (mobBottomEdge + deltaY > tileTopEdge && (mobRightEdge > tileLeftEdge && mobLeftEdge < tileRightEdge)) { // collision up!
              positionInstance.posY = tileTopEdge - rigidInstance.height;
              moveInstance.veloY = 0;
            } else {
              positionInstance.posY += deltaY;
            }
    
          } else if (!movingDown && WORLD_TILES.tiles[ceilingGridPos]) { // approaching not air above
            const tileBottomEdge = getRawYFromGrid(ceilingGridPos) + g.TILE_SIZE;
            const tileRightEdge = getRawXFromGrid(ceilingGridPos) + g.TILE_SIZE;
            const tileLeftEdge = getRawXFromGrid(ceilingGridPos);
    
            if (mobTopEdge + deltaY < tileBottomEdge && (mobRightEdge > tileLeftEdge || mobLeftEdge < tileRightEdge)) { // collision down!
              positionInstance.posY = tileBottomEdge;
              moveInstance.veloY = 0;
            } else {
              positionInstance.posY += deltaY;
            }
    
          } else {
            positionInstance.posY += deltaY;
          }
        } else { // mob not rigid
          positionInstance.posY += deltaY;
        }
      }
      break;
    case "Shop" || "Home":
      // handle x-axis movement
      if (mobRightEdge + deltaX > SCREEN_WIDTH) { // beyond right wall
        moveInstance.veloX = 0;
        positionInstance.posX = SCREEN_WIDTH - rigidInstance.width;
      } else if (mobLeftEdge + deltaX < 0) { // beyond left wall
        moveInstance.veloX = 0;
        positionInstance.posX = 0;
      } else { // not at world-boundary
        if (rigidInstance && !xStop) {
          // should actually check for collision with furniture items
          positionInstance.posX += deltaX;
        } else { // mob not rigid
          positionInstance.posX += deltaX;
        }
      } 

      // handle y-axis movement
      if (mobBottomEdge + deltaY > SCREEN_HEIGHT) { // beyond right wall
        moveInstance.veloY = 0;
        positionInstance.posY = SCREEN_HEIGHT - rigidInstance.height;
      } else if (mobTopEdge + deltaY < 0) { // beyond left wall
        moveInstance.veloY = 0;
        positionInstance.posY = 0;
      } else { // not at world-boundary
        if (rigidInstance && !yStop) {
          // should actually check for collision with furniture items
          positionInstance.posY += deltaY;
        } else { // mob not rigid
          positionInstance.posY += deltaY;
        }
      } 
      
      break;
  }

  fetchPickaxeForPlayer(playerInstance.id);
}

export const playerDig = (gridLocation) => {
  if (!WORLD_TILES.tiles[gridLocation]) return;
  
  const playerInstance = query("Player")[0]; // ASSUMING ONLY ONE PLAYER INSTANCE
  const pickaxeInstance = getComponent(playerInstance.pickaxeId, "Pickaxe");

  if (!pickaxeInstance || pickaxeInstance.toughness < 1) return;
    
  const mineInstance = getComponentWithGridPos(gridLocation, "Mine");
  const damageDealt = Math.min(pickaxeInstance.toughness, pickaxeInstance.strength, mineInstance.toughness);

  // damage the pick
  pickaxeInstance.toughness -= damageDealt;
  if (pickaxeInstance.toughness < 1) {
    const pickDrawInstance = getComponent(pickaxeInstance.id, "Draw");
    pickDrawInstance.sprite.visible = false;
  }
  
  // remvoe focused tile if tile destroyed
  //
  // remove tile focus overlay if player move and set focus to null
  
  // damage the tile
  mineInstance.toughness -= damageDealt;
  if (mineInstance.toughness < 1) {

    // clear tile map reference
    WORLD_TILES.tiles[gridLocation] = 0;
    // if (getComponent(id, "GridTile")) WORLD_TILES.tiles[getComponentGridPos(id)] = 0;
    
    const playerControlInstance = getComponent(playerInstance.id, "PlayerControlled");
    playerControlInstance.focusedTile = null;
    playerInstance.wallet += mineInstance.value;
    clearEntity(mineInstance.id);
  }
}

export const clearEntity = (id) => {
  // clear sprites
  getComponent(id, "Draw").sprite.destroy();

  // clear componentList refrences
  Object.keys(componentLists).forEach(type => {
    const instanceIndex = componentLists[type].indexOf(getComponent(id, type));
    
    if (getComponent(id, type)) componentLists[type].splice(instanceIndex, 1);
  });

  // let god handle the rest (JS GC)
}