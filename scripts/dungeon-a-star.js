class DungeonAStar {
  /**
   * A* algorithm
   * @param {Object} start
   * @param {number} start.x
   * @param {number} start.y
   * @param {Object} end
   * @param {number} end.x
   * @param {number} end.y
   */
  static aStarAlgorithm(start, end, size, verbose) {
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
          fScore: DungeonAStar.#distance(start, end),
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
            current.gScore +
            DungeonAStar.#tileGScore(`${neighbor.x},${neighbor.y}`);
          const fScore = gScore + DungeonAStar.#distance(neighbor, end);
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
  }

  static #distance(start, end) {
    return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
  }

  static #tileGScore(id) {
    const [x, y] = id.split(",");
    const board = document.querySelector(".dungeon-board > tbody:nth-child(1)");
    const row = board.children[y];
    const tile = row.children[x];
    if (!tile) {
      AutoBattleDungeon.verbose && console.log("Not found", id, x, y);
      return 1_000_000;
    }
    if (tile.classList.contains("tile-invisible")) {
      return 3;
    }
    if (tile.classList.contains("tile-enemy")) {
      return 10;
    }
    return 1;
  }
}
