import Component from "../lib/component.js";
import { app } from "./init-pixi.js";

export class Position extends Component {
  constructor(x, y) {
    super();
    this.x = x ?? 0;
    this.y = y ?? 0;
  }
}

export class RigidBody extends Component {
  constructor(vx, vy, gravity = 1) {
    super();
    this.vx = vx ?? 0;
    this.vy = vy ?? 0;
    this.gravity = gravity;
  }
}

export class Box extends Component {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
}

export class Draw extends Component {
  constructor(sprite, anchorX, anchorY, stage) {
    super();
    this.sprite = sprite;
    this.sprite.anchor.set(anchorX, anchorY);

    if (stage) {
      stage.addChild(this.sprite);
    } else {
      app.stage.addChild(this.sprite);
      console.log(app.stage.children);
    }
  }

  zIndex(num) {
    this.sprite.zIndex = num;
    return this;
  }
}
