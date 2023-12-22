class AutoFrontier {
  static custom = false;

  static start() {
    if (AutoFrontier.custom) {
      return;
    }
    BattleFrontierRunner.originalBattleLost = BattleFrontierRunner.battleLost;
    BattleFrontierRunner.battleLost = () => {
      BattleFrontierRunner.originalBattleLost();
      BattleFrontierRunner.start();
    };
    AutoFrontier.custom = true;
    return true;
  }

  static stop() {
    BattleFrontierRunner.battleLost = BattleFrontierRunner.originalBattleLost;
    AutoFrontier.custom = false;
  }

  static isRunning() {
    return AutoFrontier.custom;
  }
}
