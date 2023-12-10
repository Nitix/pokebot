class AutoBattleDungeon {
  static #startButtonSelector =
    "#townView > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1)";
  static #stop = true;
  static chestMode = ["rare", "epic", "legendary", "mythic"];
  static verbose = false;

  static start(options = {}) {
    AutoBattleDungeon.#stop = false;
    if (options) {
      if (options.chestMode) {
        AutoBattleDungeon.chestMode = options.chestMode;
      }
      if (options.verbose) {
        AutoBattleDungeon.verbose = options.verbose;
      }
    }
    AutoBattleDungeon.#startDungeon();
  }

  static stop() {
    AutoBattleDungeon.#stop = true;
  }

  static isRunning() {
    return !AutoBattleDungeon.#stop;
  }

  #size;
  #middle;
  #positionX;
  #positionY;
  #positionXBoss = null;
  #positionYBoss = null;
  #initial = true;
  #moveToRight = false;
  #moveToTop = true;
  #sizeChanged = false;
  #hasMoveLeftOrRightOnce = false;

  constructor() {
    AutoBattleDungeon.running = true;
    this.#size = document.querySelector(
      ".dungeon-board > tbody:nth-child(1)"
    ).children.length;
    this.#middle = Math.floor(this.#size / 2);
    this.#positionX = this.#middle;
    this.#positionY = this.#size - 1;
    requestAnimationFrame(this.#move.bind(this));
  }

  static #startRunner() {
    if (AutoBattleDungeon.#stop) {
      return;
    }
    new AutoBattleDungeon();
  }

  static #startDungeon() {
    if (AutoBattleDungeon.#stop) {
      return;
    }
    const button = document.querySelector(
      AutoBattleDungeon.#startButtonSelector
    );
    if (button) {
      button.click();
      requestAnimationFrame(AutoBattleDungeon.#startRunner.bind(this));
      return;
    }
  }

  static isDungeonStillRunning = () => document.querySelector(".dungeon-board");

  #getBossPosition() {
    const tile = document.querySelector(".tile-boss, .tile-ladder");
    if (!tile) {
      this.#positionXBoss = null;
      this.#positionYBoss = null;
      return;
    }
    const parent = tile.parentElement;
    this.#positionXBoss = [...parent.children].indexOf(tile);
    this.#positionYBoss = [...parent.parentElement.children].indexOf(parent);
  }

  #getCurrentPlayerPosition() {
    const tile = document.querySelector(".tile-player");
    if (!tile) {
      this.#sizeChanged = true; // Failsafe, reset dungeon
      return;
    }
    const parent = tile.parentElement;
    this.#positionX = [...parent.children].indexOf(tile);
    this.#positionY = [...parent.parentElement.children].indexOf(parent);
    this.#sizeChanged = parent.children.length !== this.#size;
  }

  #moveUp() {
    AutoBattleDungeon.verbose && console.log("Moving up");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      code: "ArrowUp",
    });
    document.dispatchEvent(event);
    if (this.#hasMoveLeftOrRightOnce) {
      this.#moveToRight = !this.#moveToRight;
      this.#hasMoveLeftOrRightOnce = false;
    }
    requestAnimationFrame(this.#chooseWhatToDo.bind(this));
  }

  #moveDown() {
    AutoBattleDungeon.verbose && console.log("Moving down");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    document.dispatchEvent(event);
    if (this.#hasMoveLeftOrRightOnce) {
      this.#moveToRight = !this.#moveToRight;
      this.#hasMoveLeftOrRightOnce = false;
    }
    requestAnimationFrame(this.#chooseWhatToDo.bind(this));
  }

  #moveLeft() {
    AutoBattleDungeon.verbose && console.log("Moving left");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      code: "ArrowLeft",
    });
    this.#hasMoveLeftOrRightOnce = true;
    document.dispatchEvent(event);
    requestAnimationFrame(this.#chooseWhatToDo.bind(this));
  }

  #moveRight(ignoreSettingPosition = false) {
    AutoBattleDungeon.verbose && console.log("Moving right");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      code: "ArrowRight",
    });
    this.#hasMoveLeftOrRightOnce = true;
    document.dispatchEvent(event);
    requestAnimationFrame(this.#chooseWhatToDo.bind(this));
  }

  #isBossTileClickable() {
    const bossTile = document.querySelector(".tile-boss, .tile-ladder");
    if (!bossTile) {
      return false;
    }
    const positionXChest = [...bossTile.parentElement.children].indexOf(
      bossTile
    );
    const positionYChest = [
      ...bossTile.parentElement.parentElement.children,
    ].indexOf(bossTile.parentElement);

    // at least one tile around the boss tile must be visited
    const tiles = [];
    if (positionXChest > 0) {
      tiles.push(bossTile.parentElement.children[positionXChest - 1]);
    }
    if (positionXChest < bossTile.parentElement.children.length - 1) {
      tiles.push(bossTile.parentElement.children[positionXChest + 1]);
    }
    if (positionYChest > 0) {
      tiles.push(
        bossTile.parentElement.parentElement.children[positionYChest - 1]
          .children[positionXChest]
      );
    }
    if (
      positionYChest <
      bossTile.parentElement.parentElement.children.length - 1
    ) {
      tiles.push(
        bossTile.parentElement.parentElement.children[positionYChest + 1]
          .children[positionXChest]
      );
    }
    return tiles.some((tile) => tile.classList.contains("tile-visited"));
  }

  #moveToBoss() {
    this.#getBossPosition();
    if (this.#positionXBoss === null && this.#positionYBoss === null) {
      return false;
    }
    AutoBattleDungeon.verbose && console.log("Go to boss");
    const bossTile = document.querySelector(".tile-boss, .tile-ladder");
    if (bossTile && this.#isBossTileClickable()) {
      const event = new MouseEvent("click");
      bossTile.dispatchEvent(event);
      DungeonRunner.handleInteraction();
      requestAnimationFrame(this.#interact.bind(this));
      return true;
    }
    return this.#goToTile(this.#positionXBoss, this.#positionYBoss);
  }

  #goToTile(X, Y) {
    const next = DungeonAStar.aStarAlgorithm(
      { x: this.#positionX, y: this.#positionY },
      { x: X, y: Y },
      this.#size
    );
    if (next) {
      X = next.x;
      Y = next.y;
    }
    if (Y < this.#positionY) {
      this.#moveUp(true);
      return true;
    } else if (Y > this.#positionY) {
      this.#moveDown(true);
      return true;
    } else if (X < this.#positionX) {
      this.#moveLeft(true);
      return true;
    } else if (X > this.#positionX) {
      this.#moveRight(true);
      return true;
    }
    return false;
  }

  #allTilesCleared() {
    const tiles = document.querySelectorAll(".tile-visited");
    return tiles.length === this.#size * this.#size - 1; // -1 because of the player tile
  }

  #chooseWhatToDo() {
    if (
      DungeonRunner.map.currentTile().type() === GameConstants.DungeonTile.chest
    ) {
      this.#interact();
      return;
    }
    if (
      [
        GameConstants.DungeonTile.boss,
        GameConstants.DungeonTile.ladder,
      ].includes(DungeonRunner.map.currentTile().type()) &&
      this.#allTilesCleared()
    ) {
      this.#interact();
      return;
    }
    this.#move();
    return;
  }

  #move() {
    if (AutoBattleDungeon.#stop) {
      return;
    }
    if (!AutoBattleDungeon.isDungeonStillRunning()) {
      console.log("Dungeon finished");
      requestAnimationFrame(AutoBattleDungeon.#startDungeon.bind(this));
      return;
    }

    if (DungeonRunner.fighting() || DungeonBattle.catching()) {
      requestAnimationFrame(this.#move.bind(this));
      return;
    }

    this.#getCurrentPlayerPosition();
    if (this.#sizeChanged) {
      console.log("Dungeon size changed");
      requestAnimationFrame(AutoBattleDungeon.#startRunner.bind(this));
      return;
    }

    if (this.#allTilesCleared() && this.#moveToBoss()) {
      return;
    }

    if (this.#initial) {
      this.#moveLeft();
      if (this.#positionX <= 0) {
        this.#initial = false;
        this.#moveToRight = true;
      }
      return;
    }
    if (this.#positionY === 0) {
      this.#moveToTop = false;
    }

    const moveBottomOrTop = () => {
      if (this.#moveToTop) {
        this.#moveUp();
        return;
      }
      this.#moveDown();
      return;
    };

    if (this.#moveToRight) {
      if (this.#positionX === this.#size - 1) {
        moveBottomOrTop();
        return;
      }
      this.#moveRight();
      return;
    } else {
      if (this.#positionX === 0) {
        moveBottomOrTop();
        return;
      }
      this.#moveLeft();
      return;
    }
  }

  #interact() {
    if (AutoBattleDungeon.#stop) {
      return;
    }
    if (!AutoBattleDungeon.isDungeonStillRunning()) {
      console.log("Dungeon finished");
      requestAnimationFrame(AutoBattleDungeon.#startDungeon.bind(this));
      return;
    }
    this.#getCurrentPlayerPosition();
    if (
      this.#positionX === this.#middle &&
      this.#positionY === this.#size - 1
    ) {
      requestAnimationFrame(this.#move.bind(this));
      return;
    }

    DungeonRunner.handleInteraction();
    requestAnimationFrame(this.#move.bind(this));
  }
}
