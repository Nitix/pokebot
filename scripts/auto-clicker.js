class AutoClicker {
  static intervalTimer = null;
  static #speed = 100;

  static start() {
    if (AutoClicker.intervalTimer) {
      return;
    }
    AutoClicker.intervalTimer = setInterval(() => {
      if (App.game.gameState === GameConstants.GameState.dungeon) {
        if (DungeonRunner.fighting()) {
          DungeonRunner.handleInteraction();
        }
        return;
      }
      if (App.game.gameState === GameConstants.GameState.gym) {
        GymBattle.clickAttack();
        return;
      }
      if (App.game.gameState === GameConstants.GameState.temporaryBattle) {
        TemporaryBattleBattle.clickAttack();
        return;
      }
      if (App.game.gameState === GameConstants.GameState.fighting) {
        Battle.clickAttack();
        return;
      }
    }, AutoClicker.#speed);
  }

  static stop() {
    clearInterval(AutoClicker.intervalTimer);
    this.intervalTimer = null;
  }

  static speed(speed) {
    AutoClicker.#speed = speed;
    if (!AutoClicker.intervalTimer) {
      return;
    }
    AutoClicker.stop();
    AutoClicker.start();
  }
}
