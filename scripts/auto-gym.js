class AutoGym {
  static originalMethod = null;

  static start() {
    if (AutoGym.originalMethod) {
      return;
    }
    AutoGym.originalMethod = GymRunner.gymWon;
    GymRunner.gymWon = (gym) => {
      AutoGym.originalMethod(gym);
      GymRunner.startGym(gym);
    };
    return true;
  }

  static stop() {
    GymRunner.gymWon = AutoGym.originalMethod;
    AutoGym.originalMethod = null;
  }

  static isRunning() {
    return !!AutoGym.originalMethod;
  }
}
