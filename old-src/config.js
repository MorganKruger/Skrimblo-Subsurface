// IRL-based values
export const METER = 6; // maybe ~5 px per meter
export const GRAVITY = 9.81 * METER; 
export const FPS = 60;

// grid values
export const WORLD_WIDTH = 24;
export const WORLD_DEPTH = 80;
export const MINE_WIDTH = 20;
export const MINE_DEPTH = 69;
export const MINE_GRID_X = 2;
export const MINE_GRID_Y = 7;
export const MINE_ORE_BUFFER = MINE_GRID_Y + 2;

// pixel values
export const TILE_SIZE = 16;
export const JUMP_BUFFER = 2;

// world setup
export const OVERWORLD_SPAWN_X = (MINE_WIDTH + MINE_GRID_X) * TILE_SIZE / 2;
export const OVERWORLD_SPAWN_Y = (MINE_GRID_Y - 2) * TILE_SIZE;

// content enums
export const AMBIENT_MATERIAL_CHANCE = .75; 
export const TILE_AMBIENT_MATERIAL = {
  Dirt: { typeId: 1, imgPath: "./assets/tile_sprites/tile_dirt.png", value: 0, toughness: 4 },
  Stone: { typeId: 2, imgPath: "./assets/tile_sprites/tile_stone.png", value: 0, toughness: 8 },
  HardStone: { typeId: 3, imgPath: "./assets/tile_sprites/tile_hard_stone.png", value: 0, toughness: 16 },
  Magma: { typeId: 4, imgPath: "./assets/tile_sprites/tile_magma.png", value: 0, toughness: 32 }
}
export const TILE_VALUABLE_MATERIAL = {
  Copper: { typeId: 5, imgPath: "./assets/tile_sprites/tile_copper.png", value: 10, toughness: 5 },
  Iron: { typeId: 6, imgPath: "./assets/tile_sprites/tile_iron.png", value: 20, toughness: 7 },
  Silver: { typeId: 7, imgPath: "./assets/tile_sprites/tile_silver.png", value: 40, toughness: 8 },
  Gold: { typeId: 8, imgPath: "./assets/tile_sprites/tile_gold.png", value: 100, toughness: 7 },
  Amethyst: { typeId: 9, imgPath: "./assets/tile_sprites/tile_amethyst.png", value: 150, toughness: 12 },
  Emerald: { typeId: 10, imgPath: "./assets/tile_sprites/tile_emerald.png", value: 190, toughness: 15 },
  Ruby: { typeId: 11, imgPath: "./assets/tile_sprites/tile_ruby.png", value: 240, toughness: 18 },
  Sapphire: { typeId: 12, imgPath: "./assets/tile_sprites/tile_sapphire.png", value: 320, toughness: 22 },
  Diamond: { typeId: 13, imgPath: "./assets/tile_sprites/tile_diamond.png", value: 500, toughness: 48 },
  Skrimblonium: { typeId: 14, imgPath: "./assets/tile_sprites/tile_skrimblonium.png", value: 1000, toughness: 80 }
}

export const STARTER_PICK_TYPE = "Expensive";
export const PICKAXES = {
  Wood: { typeId: 1, imgPath: "./assets/tool_sprites/pickaxe_wood", price: 0, toughness: 35, strength: 1 },
  Stone: { typeId: 2, imgPath: "./assets/tool_sprites/pickaxe_stone", price: 100, toughness: 50, strength: 2 },
  Copper: { typeId: 3, imgPath: "./assets/tool_sprites/pickaxe_copper", price: 250, toughness: 75, strength: 3 },
  Iron: { typeId: 4, imgPath: "./assets/tool_sprites/pickaxe_iron", price: 500, toughness: 110, strength: 4 },
  Silver: { typeId: 5, imgPath: "./assets/tool_sprites/pickaxe_silver", price: 1000, toughness: 150, strength: 5 },
  Gold: { typeId: 6, imgPath: "./assets/tool_sprites/pickaxe_gold", price: 2250, toughness: 200, strength: 6 },
  Amethyst: { typeId: 7, imgPath: "./assets/tool_sprites/pickaxe_amethyst", price: 3450, toughness: 250, strength: 7 },
  Emerald: { typeId: 8, imgPath: "./assets/tool_sprites/pickaxe_emerald", price: 4200, toughness: 300, strength: 8 },
  Ruby: { typeId: 9, imgPath: "./assets/tool_sprites/pickaxe_ruby", price: 6000, toughness: 420, strength: 11 },
  Sapphire: { typeId: 10, imgPath: "./assets/tool_sprites/pickaxe_sapphire", price: 8000, toughness: 550, strength: 13 },
  Diamond: { typeId: 11, imgPath: "./assets/tool_sprites/pickaxe_diamond", price: 10500, toughness: 800, strength: 16 },
  Expensive: { typeId: 12, imgPath: "./assets/tool_sprites/pickaxe_expensive", price: 15000, toughness: 1500, strength: 50 }
}

// maybe there should be a way to ensure that a "thing" with the GRAVITY flag also has veloX and veloY properties
// GRAVITY wouldn't exist if they didn't also require a movement step, but not all things that move should have gravity
// gravity is a subset of moving things: there should be a warning for having gravity, but not move flag (also that draw, rigid, gravity, and friction have position)

// #region
// const SKRIMBLO_ANIMATIONS= {
//   Impose: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_impose.json"]),
//   Kneel: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_kneel.json"]),
//   Idle: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_idle.json"]),
//   Unconscious: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_unconscious.json"]),
//   Relax: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_relax.json"]),
//   Run: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_run.json"]),
//   Wave: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_wave.json"]),
//   RelaxLean: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_relax_lean.json"]),
//   Assert: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_assert.json"]),
//   Hail: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_hail.json"]),
//   Defeat: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_defeat.json"]),
//   Reach: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_reach.json"]),
//   Behold: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_behold.json"]),
//   Chuck: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_chuck.json"]),
//   Fling: new PIXI.AnimatedSprite(PIXI.Loader.shared.resources["./assets/sprite_sheets/skrimblo_fling.json"]),
// };
//#endregion

// const strictQuery = (firstArray, ...arrays) => { // with list of components, return array of entity id's that associate with only the given components -- strict inner join (no extra data) all component lists provided
//   const filteredIds = query(firstArray, ...arrays); // Integer array of IDs
//   let strictFilteredIds = filteredIds;
//   const filteredComponentLists = Object.keys(componentLists).filter(element => !arrays.includes(element)); // anti-left join (componentLists <- arrays)
//   // REMOVE FROM filteredIds IF A MATCH IS FOUND IN ANY OTHER filteredComponentLists ARRAY. 
//   filteredIds.forEach(instanceId => {
//     filteredComponentLists.forEach(idList => { 
//       strictFilteredIds.splice(idList.indexOf(instanceId), 1)
//       // if (idList.includes(id)) {
//       //  strictFilteredIds = strictFilteredIds.filter(e => e !== id)
//       // }
//     });
//   });
//   return strictFilteredIds;
// }
