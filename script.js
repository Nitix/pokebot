let startButtonSelector =
  "#townView > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1)";

let stop = false;

let startDungeon = () => {
  if (stop) {
    console.log("Stop requested");
    return;
  }
  const button = document.querySelector(startButtonSelector);
  if (button) {
    button.click();
    requestAnimationFrame(configureDungeon, 2000);
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
  let initial = true;
  let moveToRight = true;
  let expectedRow = size - 1;
  let sizeChanged = false;
  let hasMoveLeftOrRightOnce = false;
  let hasInteracted = false;

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
