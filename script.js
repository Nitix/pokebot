let startButtonSelector =
  "#townView > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1)";

let stop = false;

let chestMode = ["epic", "rare", "legendary"];

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

  const moveDown = (force = false) => {
    // Fix move two
    console.log("Moving down");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    document.dispatchEvent(event);
    if (!force && hasMoveLeftOrRightOnce) {
      moveToRight = !moveToRight;
      expectedRow = positionY + 1;
      hasMoveLeftOrRightOnce = false;
    }
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

  const goToTile = (X, Y) => {
    if (Y < positionY) {
      moveUp();
      return true;
    } else if (Y > positionY) {
      moveDown();
      return true;
    } else if (X < positionX) {
      moveLeft();
      return true;
    } else if (X > positionX) {
      moveRight();
      return true;
    }
    return false;
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
        const moved = goToTile(positionXChest, positionYChest);
        if (moved) {
          return;
        }
      }
    }
    getBossPosition();
    if (positionXBoss !== null && positionYBoss !== null) {
      console.log("Go to boss");
      const moved = goToTile(positionXBoss, positionYBoss);
      if (moved) {
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
