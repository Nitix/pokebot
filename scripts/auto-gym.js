class AutoGym {
  static custom = false;

  static start() {
    if (AutoGym.custom) {
      return;
    }
    GymRunner.originalGymWon = GymRunner.gymWon;
    GymRunner.gymWon = (gym) => {
      GymRunner.originalGymWon(gym);
      GymRunner.startGym(gym);
    };
    AutoGym.custom = true;
    return true;
  }

  static stop() {
    GymRunner.gymWon = GymRunner.originalGymWon;
    AutoGym.custom = false;
  }

  static isRunning() {
    return AutoGym.custom;
  }
}
