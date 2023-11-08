let startButtonSelector =
  "#townView > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1)";

let stop = false;

let chestMode = ["rare", "epic", "legendary", "mythic"];

let startDungeon = (init = false) => {
  if (init) {
    stop = false;
  }
  if (stop) {
    console.log("Stop requested");
    return;
  }
  const button = document.querySelector(startButtonSelector);
  if (button) {
    button.click();
    setTimeout(configureDungeon, 15);
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
  let choosenChestName = "";
  let initial = true;
  let moveToRight = true;
  let moveToTop = true;
  let sizeChanged = false;
  let hasMoveLeftOrRightOnce = false;
  let openedChests = 0;

  const getBossPosition = () => {
    const tile = document.querySelector(".tile-boss, .tile-ladder");
    if (!tile) {
      positionXBoss = null;
      positionYBoss = null;
      return;
    }
    const parent = tile.parentElement;
    positionXBoss = [...parent.children].indexOf(tile);
    positionYBoss = [...parent.parentElement.children].indexOf(parent);
  };

  const wantedChests = (chestMode) => {
    let query = "";
    if (Array.isArray(chestMode)) {
      query = chestMode.map((mode) => `.tile-chest-${mode}`).join(",");
    } else {
      query = `.tile-chest-${chestMode}`;
    }
    return document.querySelectorAll(query);
  };

  const getChestPosition = (chestMode) => {
    const tiles = wantedChests(chestMode);
    if (!tiles || !tiles.length) {
      positionXChest = null;
      positionYChest = null;
      return;
    }
    const lastTile = tiles[tiles.length - 1];
    choosenChestName = lastTile.className
      .split(" ")
      .find((e) => e.includes("tile-chest-"))
      .substring(11);
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

  const allChestsDiscovered = () => {
    const chests = document.querySelectorAll(".tile-chest");
    return chests.length + openedChests === size;
  };

  const wantedChestsStillPresents = () => {
    const chests = wantedChests(chestMode);
    return chests.length > 0 || !allChestsDiscovered();
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
      hasMoveLeftOrRightOnce = false;
    }
    setTimeout(chooseWhatToDo, 15);
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
      hasMoveLeftOrRightOnce = false;
    }
    setTimeout(chooseWhatToDo, 15);
  };

  const moveLeft = () => {
    console.log("Moving left");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      code: "ArrowLeft",
    });
    hasMoveLeftOrRightOnce = true;
    document.dispatchEvent(event);
    setTimeout(chooseWhatToDo, 15);
  };

  const moveRight = () => {
    console.log("Moving right");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      code: "ArrowRight",
    });
    hasMoveLeftOrRightOnce = true;
    document.dispatchEvent(event);
    setTimeout(chooseWhatToDo, 15);
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

  const chooseWhatToDo = () => {
    if (
      DungeonRunner.map.currentTile().type() === GameConstants.DungeonTile.chest
    ) {
      openedChests++;
      interact();
      return;
    }
    if (
      DungeonRunner.map.currentTile().type() ===
        GameConstants.DungeonTile.boss &&
      !wantedChestsStillPresents()
    ) {
      interact();
      return;
    }
    if (
      DungeonRunner.map.currentTile().type() ===
        GameConstants.DungeonTile.ladder &&
      !wantedChestsStillPresents()
    ) {
      interact();
      return;
    }
    move();
    return;
  };

  const move = () => {
    if (stop) {
      return;
    }
    if (!isDungeonStillRunning()) {
      console.log("Dungeon finished");
      setTimeout(startDungeon, 15);
      return;
    }

    if (DungeonRunner.fighting() || DungeonBattle.catching()) {
      setTimeout(move, 15);
      return;
    }

    getCurrentPlayerPosition();
    if (sizeChanged) {
      setTimeout(configureDungeon, 15);
      return;
    }

    if (chestMode) {
      getChestPosition(chestMode);
      if (positionXChest !== null && positionYChest !== null) {
        console.log(`Go to ${choosenChestName} chest`);
        const moved = goToTile(positionXChest, positionYChest);
        if (moved) {
          return;
        }
      }
    }
    if (!wantedChestsStillPresents()) {
      getBossPosition();
      if (positionXBoss !== null && positionYBoss !== null) {
        console.log("Go to boss");
        const moved = goToTile(positionXBoss, positionYBoss);
        if (moved) {
          return;
        }
      }
    }

    if (initial) {
      moveLeft();
      if (positionX <= 0) {
        initial = false;
      }
      return;
    }
    if (positionY === 0) {
      moveToTop = false;
    }
    if (moveToRight) {
      if (positionX === size - 1) {
        if (!moveToTop) {
          moveDown();
          return;
        }
        moveUp();
        return;
      }
      moveRight();
      return;
    } else {
      if (positionX === 0) {
        if (!moveToTop) {
          moveDown();
          return;
        }
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
      setTimeout(startDungeon, 15);
      return;
    }
    getCurrentPlayerPosition();
    if (positionX === middle && positionY === size - 1) {
      setTimeout(move, 15);
      return;
    }

    DungeonRunner.handleInteraction();
    setTimeout(move, 15);
  };

  setTimeout(move, 15);
};
