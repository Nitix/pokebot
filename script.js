let startButtonSelector =
  "#townView > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1)";

let stop = false;

let chestMode = ["rare", "epic", "legendary", "mythic"];
let verbose = false;

let startDungeon = (init = false, options = {}) => {
  if (init) {
    stop = false;
  }

  if (options) {
    if (options.chestMode) {
      chestMode = options[key];
    }
    if (options.verbose) {
      verbose = options.verbose;
    }
  }

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
  let chosenChestName = "";
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
          Math.abs(positionX - positionXChest) +
          Math.abs(positionY - positionYChest);
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
    positionXChest = tile.positionXChest;
    positionYChest = tile.positionYChest;
    chosenChestName = tile.chosenChestName;
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
    verbose && console.log("Moving up");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      code: "ArrowUp",
    });
    document.dispatchEvent(event);
    if (!force && hasMoveLeftOrRightOnce) {
      moveToRight = !moveToRight;
      hasMoveLeftOrRightOnce = false;
    }
    requestAnimationFrame(chooseWhatToDo);
  };

  const moveDown = (force = false) => {
    verbose && console.log("Moving down");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
    });
    document.dispatchEvent(event);
    if (!force && hasMoveLeftOrRightOnce) {
      moveToRight = !moveToRight;
      hasMoveLeftOrRightOnce = false;
    }
    requestAnimationFrame(chooseWhatToDo);
  };

  const moveLeft = () => {
    verbose && console.log("Moving left");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      code: "ArrowLeft",
    });
    hasMoveLeftOrRightOnce = true;
    document.dispatchEvent(event);
    requestAnimationFrame(chooseWhatToDo);
  };

  const moveRight = () => {
    verbose && console.log("Moving right");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      code: "ArrowRight",
    });
    hasMoveLeftOrRightOnce = true;
    document.dispatchEvent(event);
    requestAnimationFrame(chooseWhatToDo);
  };

  const moveToChest = (chestMode) => {
    getChestPosition(chestMode);
    if (positionXChest === null || positionYChest === null) {
      return false;
    }
    verbose && console.log(`Go to ${chosenChestName} chest`);
    return goToTile(positionXChest, positionYChest);
  };

  const moveToBoss = () => {
    getBossPosition();
    if (positionXBoss === null && positionYBoss === null) {
      return false;
    }
    verbose && console.log("Go to boss");
    const event = new MouseEvent("click");
    const bossTile = document.querySelector(".tile-boss, .tile-ladder");
    if (bossTile) {
      bossTile.dispatchEvent(event);
      DungeonRunner.handleInteraction();
    }
    return goToTile(positionXBoss, positionYBoss);
  };

  const goToTile = (X, Y) => {
    const next = aStarAlgorithm({ x: positionX, y: positionY }, { x: X, y: Y });
    if (next) {
      X = next.x;
      Y = next.y;
    }
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
      [
        GameConstants.DungeonTile.boss,
        GameConstants.DungeonTile.ladder,
      ].includes(DungeonRunner.map.currentTile().type()) &&
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
      if (moveToChest(chestMode)) {
        return;
      }
      if (!wantedChestsStillPresents() && moveToBoss()) {
        return;
      }
      if (moveToChest(["common", "rare", "epic", "legendary", "mythic"])) {
        return;
      }
    } else {
      if (!moveToTop && moveToBoss()) {
        return;
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
      requestAnimationFrame(startDungeon);
      return;
    }
    getCurrentPlayerPosition();
    if (positionX === middle && positionY === size - 1) {
      requestAnimationFrame(move);
      return;
    }

    DungeonRunner.handleInteraction();
    requestAnimationFrame(move);
  };

  /**
   * A* algorithm
   * @param {Object} start
   * @param {number} start.x
   * @param {number} start.y
   * @param {Object} end
   * @param {number} end.x
   * @param {number} end.y
   */
  const aStarAlgorithm = (start, end) => {
    try {
      if (start.x === end.x && start.y === end.y) {
        verbose && console.log("Already on the tile");
        return null;
      }
      let openSet = [
        {
          x: start.x,
          y: start.y,
          parent: null,
          gScore: 0,
          fScore: distance(start, end),
        },
      ];
      while (openSet.length) {
        let current = openSet.reduce((prev, current) => {
          if (!prev) {
            return current;
          }
          if (current.fScore < prev.fScore) {
            return current;
          }
          return prev;
        }, null);
        if (current.x === end.x && current.y === end.y) {
          let path = [current];
          while (current.parent) {
            path.push(current.parent);
            current = current.parent;
          }
          return path[path.length - 2];
        }
        openSet = openSet.filter((e) => e !== current);
        const neighbors = [
          { x: current.x - 1, y: current.y },
          { x: current.x + 1, y: current.y },
          { x: current.x, y: current.y - 1 },
          { x: current.x, y: current.y + 1 },
        ];
        for (const neighbor of neighbors) {
          if (
            neighbor.x < 0 ||
            neighbor.x >= size ||
            neighbor.y < 0 ||
            neighbor.y >= size
          ) {
            continue;
          }
          if (neighbor.x === current.x && neighbor.y === current.y) {
            continue;
          }
          const gScore =
            current.gScore + tileGScore(`${neighbor.x},${neighbor.y}`);
          const fScore = gScore + distance(neighbor, end);
          const existing = openSet.find(
            (e) => e.x === neighbor.x && e.y === neighbor.y
          );
          if (existing) {
            if (existing.gScore > gScore) {
              existing.gScore = gScore;
              existing.fScore = fScore;
              existing.parent = current;
            }
          } else {
            openSet.push({
              x: neighbor.x,
              y: neighbor.y,
              parent: current,
              gScore,
              fScore,
            });
          }
        }
      }
    } catch (e) {
      console.error(e.message);
      return null;
    }
  };

  const distance = (start, end) => {
    return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
  };

  const tileGScore = (id) => {
    const [x, y] = id.split(",");
    const board = document.querySelector(".dungeon-board > tbody:nth-child(1)");
    const row = board.children[y];
    const tile = row.children[x];
    if (!tile) {
      verbose && console.log("Not found", id, x, y);
      return 1_000_000;
    }
    if (tile.classList.contains("tile-invisible")) {
      return 3;
    }
    if (tile.classList.contains("tile-enemy")) {
      return 10;
    }
    return 1;
  };

  requestAnimationFrame(move);
};
