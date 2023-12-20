class AutoFrontier {
  static originalMethod = null;

  static start() {
    if (AutoFrontier.originalMethod) {
      return;
    }
    AutoFrontier.originalMethod = BattleFrontierRunner.battleLost;
    BattleFrontierRunner.battleLost = () => {
      AutoFrontier.originalMethod();
      BattleFrontierRunner.start();
    };
    return true;
  }

  static stop() {
    BattleFrontierRunner.battleLost = AutoFrontier.originalMethod;
    AutoFrontier.originalMethod = null;
  }

  static isRunning() {
    return !!AutoFrontier.originalMethod;
  }
}
