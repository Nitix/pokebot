let startButtonSelector =
  "#townView > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1)";

let stop = false;

let chestMode = ["epic", "rare"];

let startDungeon = () => {
  if (stop) {
    console.log("Stop requested");
    return;
  }
  const button = document.querySelector(startButtonSelector);
  if (button) {
    button.click();
    requestAnimationFrame(configureDungeon);
    return;
  }
};

let isDungeonStillRunning = () => document.querySelector(".dungeon-board");

let configureDungeon = () => {
  const dungeon = document.querySelector(".dungeon-board > tbody:nth-child(1)");
  const size = dungeon.children.length;
  const middle = Math.floor(size / 2);
  let positionX = middle;
  let positionY = size - 1;
  let positionXBoss = null;
  let positionYBoss = null;
  let positionXChest = null;
  let positionYChest = null;
  let initial = true;
  let moveToRight = true;
  let expectedRow = size - 1;
  let sizeChanged = false;
  let hasMoveLeftOrRightOnce = false;
  let hasInteracted = false;

  const getBossPosition = () => {
    const tile = document.querySelector(".tile-boss");
    if (!tile) {
      positionXBoss = null;
      positionYBoss = null;
      return;
    }
    const parent = tile.parentElement;
    positionXBoss = [...parent.children].indexOf(tile);
    positionYBoss = [...parent.parentElement.children].indexOf(parent);
  };

  const getChestPosition = (chestMode) => {
    let query = "";
    if (Array.isArray(chestMode)) {
      query = chestMode.map((mode) => `.tile-chest-${mode}`).join(",");
    } else {
      query = `.tile-chest-${chestMode}`;
    }
    const tiles = document.querySelectorAll(query);
    if (!tiles || !tiles.length) {
      positionXChest = null;
      positionYChest = null;
      return;
    }
    const lastTile = tiles[tiles.length - 1];
    const parent = lastTile.parentElement;
    positionXChest = [...parent.children].indexOf(lastTile);
    positionYChest = [...parent.parentElement.children].indexOf(parent);
  };

  const getCurrentPlayerPosition = () => {
    const tile = document.querySelector(".tile-player");
    if (!tile) {
      sizeChanged = true; // Failsafe, reset dungeon
      return;
    }
    const parent = tile.parentElement;
    positionX = [...parent.children].indexOf(tile);
    positionY = [...parent.parentElement.children].indexOf(parent);
    sizeChanged = parent.children.length !== size;
  };

  const moveUp = (force = false) => {
    console.log("Moving up");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      code: "ArrowUp",
    });
    document.dispatchEvent(event);
    if (!force && hasMoveLeftOrRightOnce) {
      moveToRight = !moveToRight;
      expectedRow = positionY - 1;
      hasMoveLeftOrRightOnce = false;
    }
    requestAnimationFrame(interact);
  };

  const moveDown = () => {
    // Fix move two
    console.log("Moving down");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    document.dispatchEvent(event);
    requestAnimationFrame(interact);
  };

  const moveLeft = () => {
    console.log("Moving left");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      code: "ArrowLeft",
    });
    hasMoveLeftOrRightOnce = true;
    document.dispatchEvent(event);
    requestAnimationFrame(interact);
  };

  const moveRight = () => {
    console.log("Moving right");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      code: "ArrowRight",
    });
    hasMoveLeftOrRightOnce = true;
    document.dispatchEvent(event);
    requestAnimationFrame(interact);
  };

  const move = () => {
    if (stop) {
      return;
    }
    if (!isDungeonStillRunning()) {
      console.log("Dungeon finished");
      requestAnimationFrame(startDungeon);
      return;
    }

    if (DungeonRunner.fighting() || DungeonBattle.catching()) {
      if (!hasInteracted) {
        hasInteracted = true;
        requestAnimationFrame(interact);
        return;
      }
      requestAnimationFrame(move);
      return;
    }

    getCurrentPlayerPosition();
    if (sizeChanged) {
      requestAnimationFrame(configureDungeon);
      return;
    }

    if (chestMode) {
      getChestPosition(chestMode);
      if (positionXChest !== null && positionYChest !== null) {
        console.log(`Go to ${chestMode} chest`);
        if (positionYChest < positionY) {
          moveUp();
          return;
        } else if (positionXChest < positionX) {
          moveLeft();
          return;
        } else if (positionXChest > positionX) {
          moveRight();
          return;
        }
      }
    }
    getBossPosition();
    if (positionXBoss !== null && positionYBoss !== null) {
      console.log("Go to boss");
      if (positionYBoss < positionY) {
        moveUp();
        return;
      } else if (positionXBoss < positionX) {
        moveLeft();
        return;
      } else if (positionXBoss > positionX) {
        moveRight();
        return;
      }
    }

    if (expectedRow > positionY) {
      moveDown();
      return;
    }
    if (expectedRow !== positionY && positionY !== 0) {
      moveUp();
      return;
    }
    if (initial) {
      moveLeft();
      if (positionX <= 0) {
        initial = false;
      }
      return;
    }
    if (moveToRight) {
      if (positionX === size - 1) {
        moveUp();
        return;
      }
      moveRight();
      return;
    } else {
      if (positionX === 0) {
        moveUp();
        return;
      }
      moveLeft();
      return;
    }
  };
  const interact = () => {
    if (stop) {
      return;
    }
    if (!isDungeonStillRunning()) {
      console.log("Dungeon finished");
      requestAnimationFrame(startDungeon);
      return;
    }
    getCurrentPlayerPosition();
    if (positionX === middle && positionY === size - 1) {
      requestAnimationFrame(move);
      return;
    }

    const event = new KeyboardEvent("keydown", {
      key: "Space",
      code: "Space",
    });
    document.dispatchEvent(event);
    requestAnimationFrame(move);
  };

  requestAnimationFrame(move);
};
