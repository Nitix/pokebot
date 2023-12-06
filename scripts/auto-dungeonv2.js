class AutoDungeonV2 {
  static #startButtonSelector =
    "#townView > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1)";
  static #stop = false;
  static chestMode = ["rare", "epic", "legendary", "mythic"];
  static verbose = false;

  static start(options = {}) {
    AutoDungeonV2.#stop = false;
    if (options) {
      if (options.chestMode) {
        AutoDungeonV2.chestMode = options.chestMode;
      }
      if (options.verbose) {
        AutoDungeonV2.verbose = options.verbose;
      }
    }
    AutoDungeonV2.#startDungeon();
  }

  static stop() {
    AutoDungeonV2.#stop = true;
  }

  #size;
  #middle;
  #positionX;
  #positionY;
  #positionXBoss = null;
  #positionYBoss = null;
  #positionXChest = null;
  #positionYChest = null;
  #chosenChestName = "";
  #moveToDown = false;
  #moveToLeft = true;
  #sizeChanged = false;
  #hasMoveUpOrDownOnce = false;
  #openedChests = 0;
  #flashSize = 0;
  #wantedPositionX = null;
  #wantedPositionY = null;

  constructor() {
    this.#size = document.querySelector(
      ".dungeon-board > tbody:nth-child(1)"
    ).children.length;
    this.#middle = Math.floor(this.#size / 2);
    this.#positionX = this.#middle;
    this.#positionY = this.#size - 1;
    this.#wantedPositionX = this.#positionX;
    this.#wantedPositionY = this.#positionY;
    this.#flashSize = DungeonRunner.map.flash?.playerOffset[0] ?? 0;
    requestAnimationFrame(this.#move.bind(this));
  }

  static #startRunner() {
    if (AutoDungeonV2.#stop) {
      return;
    }
    new AutoDungeonV2();
  }

  static #startDungeon() {
    if (AutoDungeonV2.#stop) {
      return;
    }
    const button = document.querySelector(AutoDungeonV2.#startButtonSelector);
    if (button) {
      button.click();
      requestAnimationFrame(AutoDungeonV2.#startRunner.bind(this));
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

  #wantedChests(chestMode) {
    let query = "";
    if (Array.isArray(chestMode)) {
      query = chestMode.map((mode) => `.tile-chest-${mode}`).join(",");
    } else {
      query = `.tile-chest-${chestMode}`;
    }
    return document.querySelectorAll(query);
  }

  #getChestPosition(chestMode) {
    const tiles = this.#wantedChests(chestMode);
    if (!tiles || !tiles.length) {
      this.#positionXChest = null;
      this.#positionYChest = null;
      return;
    }
    const tile = Array.from(tiles).reduceRight(
      (prev, current) => {
        let chosenChestName = current.className
          .split(" ")
          .find((e) => e.includes("tile-chest-"))
          .substring(11);
        const parent = current.parentElement;
        let positionXChest = [...parent.children].indexOf(current);
        let positionYChest = [...parent.parentElement.children].indexOf(parent);
        let distance =
          Math.abs(this.#positionX - positionXChest) +
          Math.abs(this.#positionY - positionYChest);
        if (prev.distance < distance) {
          return prev;
        }
        return {
          distance,
          positionXChest,
          positionYChest,
          chosenChestName,
        };
      },
      {
        distance: Infinity,
        positionXChest: null,
        positionYChest: null,
        chosenChestName: "",
      }
    );
    this.#positionXChest = tile.positionXChest;
    this.#positionYChest = tile.positionYChest;
    this.#chosenChestName = tile.chosenChestName;
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

  #allChestsDiscovered() {
    const chests = document.querySelectorAll(".tile-chest");
    return chests.length + this.#openedChests === this.#size;
  }

  #wantedChestsStillPresents() {
    const chests = this.#wantedChests(AutoDungeonV2.chestMode);
    return chests.length > 0 || !this.#allChestsDiscovered();
  }

  #moveUp(ignoreSettingPosition = false) {
    AutoDungeonV2.verbose && console.log("Moving up");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      code: "ArrowUp",
    });
    document.dispatchEvent(event);
    this.#hasMoveUpOrDownOnce = true;
    if (!ignoreSettingPosition) {
      this.#wantedPositionX = this.#positionX;
      this.#wantedPositionY = Math.max(0, this.#positionY - 1);
    }
    requestAnimationFrame(this.#chooseWhatToDo.bind(this));
  }

  #moveDown(ignoreSettingPosition = false) {
    AutoDungeonV2.verbose && console.log("Moving down");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    document.dispatchEvent(event);
    this.#hasMoveUpOrDownOnce = true;
    if (!ignoreSettingPosition) {
      this.#wantedPositionX = this.#positionX;
      this.#wantedPositionY = Math.min(this.#size - 1, this.#positionY + 1);
    }
    requestAnimationFrame(this.#chooseWhatToDo.bind(this));
  }

  #moveLeft(ignoreSettingPosition = false) {
    AutoDungeonV2.verbose && console.log("Moving left");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      code: "ArrowLeft",
    });
    if (this.#hasMoveUpOrDownOnce) {
      this.#moveToDown = !this.#moveToDown;
      this.#hasMoveUpOrDownOnce = false;
    }
    document.dispatchEvent(event);
    if (!ignoreSettingPosition) {
      this.#wantedPositionX = Math.max(0, this.#positionX - 1);
      this.#wantedPositionY = this.#positionY;
    }
    requestAnimationFrame(this.#chooseWhatToDo.bind(this));
  }

  #moveRight(ignoreSettingPosition = false) {
    AutoDungeonV2.verbose && console.log("Moving right");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      code: "ArrowRight",
    });
    if (this.#hasMoveUpOrDownOnce) {
      this.#moveToDown = !this.#moveToDown;
      this.#hasMoveUpOrDownOnce = false;
    }
    document.dispatchEvent(event);
    if (!ignoreSettingPosition) {
      this.#wantedPositionX = Math.min(this.#size - 1, this.#positionX + 1);
      this.#wantedPositionY = this.#positionY;
    }
    requestAnimationFrame(this.#chooseWhatToDo.bind(this));
  }

  #moveToChest(chestMode) {
    this.#getChestPosition(chestMode);
    if (this.#positionXChest === null || this.#positionYChest === null) {
      return false;
    }
    AutoDungeonV2.verbose &&
      console.log(`Go to ${this.#chosenChestName} chest`);
    return this.#goToTile(this.#positionXChest, this.#positionYChest);
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
    AutoDungeonV2.verbose && console.log("Go to boss");
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

  #chooseWhatToDo() {
    if (
      DungeonRunner.map.currentTile().type() === GameConstants.DungeonTile.chest
    ) {
      this.#openedChests++;
      this.#interact();
      return;
    }
    if (
      [
        GameConstants.DungeonTile.boss,
        GameConstants.DungeonTile.ladder,
      ].includes(DungeonRunner.map.currentTile().type()) &&
      !this.#wantedChestsStillPresents()
    ) {
      this.#interact();
      return;
    }
    this.#move();
    return;
  }

  #move() {
    if (AutoDungeonV2.#stop) {
      return;
    }
    if (!AutoDungeonV2.isDungeonStillRunning()) {
      console.log("Dungeon finished");
      requestAnimationFrame(AutoDungeonV2.#startDungeon.bind(this));
      return;
    }

    if (DungeonRunner.fighting() || DungeonBattle.catching()) {
      requestAnimationFrame(this.#move.bind(this));
      return;
    }

    this.#getCurrentPlayerPosition();
    if (this.#sizeChanged) {
      console.log("Dungeon size changed");
      requestAnimationFrame(AutoDungeonV2.#startRunner.bind(this));
      return;
    }

    if (AutoDungeonV2.chestMode) {
      if (this.#moveToChest(AutoDungeonV2.chestMode)) {
        return;
      }
      if (!this.#wantedChestsStillPresents() && this.#moveToBoss()) {
        return;
      }
      if (
        this.#moveToChest(["common", "rare", "epic", "legendary", "mythic"])
      ) {
        return;
      }
    } else {
      if (!this.#moveToLeft && this.#moveToBoss()) {
        return;
      }
    }

    if (
      this.#wantedPositionX !== this.#positionX ||
      this.#wantedPositionY !== this.#positionY
    ) {
      if (this.#goToTile(this.#wantedPositionX, this.#wantedPositionY)) {
        return;
      }
    }

    const moveToLeftOrRight = () => {
      if (this.#moveToLeft) {
        if (this.#positionX <= 0 + this.#flashSize) {
          this.#moveToLeft = false;
          this.#wantedPositionX = Math.min(
            this.#size - 1,
            this.#middle + (this.#flashSize * 2 + 1)
          );
          this.#wantedPositionY = this.#positionY;
          this.#moveRight(true);
          return;
        }
        this.#wantedPositionX = Math.max(
          0,
          this.#positionX - (this.#flashSize * 2 + 1)
        );
        this.#wantedPositionY = this.#positionY;
        this.#moveLeft(true);
        return;
      } else {
        if (this.#positionX >= this.#size - 1 - this.#flashSize) {
          this.#moveToLeft = true;
          this.#wantedPositionX = Math.max(
            0,
            this.#middle - (this.#flashSize * 2 + 1)
          );
          this.#wantedPositionY = this.#positionY;
          this.#moveLeft(true);
          return;
        }
        this.#wantedPositionX = Math.min(
          this.#size - 1,
          this.#positionX + (this.#flashSize * 2 + 1)
        );
        this.#wantedPositionY = this.#positionY;
        this.#moveRight(true);
        return;
      }
    };

    if (this.#moveToDown) {
      if (this.#positionY === this.#size - 1) {
        moveToLeftOrRight();
        return;
      }
      this.#moveDown();
      return;
    } else {
      if (this.#positionY === 0) {
        moveToLeftOrRight();
        return;
      }
      this.#moveUp();
    }
  }

  #interact() {
    if (AutoDungeonV2.#stop) {
      return;
    }
    if (!AutoDungeonV2.isDungeonStillRunning()) {
      console.log("Dungeon finished");
      requestAnimationFrame(AutoDungeonV2.#startDungeon.bind(this));
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
