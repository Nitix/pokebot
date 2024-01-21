class AutoGym {
  static custom = false;
  static options = AutoGym.loadDefaultConfig();

  static start() {
    if (AutoGym.custom) {
      return;
    }
    AutoGym.loadDefaultConfig(true);
    GymRunner.originalGymWon = GymRunner.gymWon;
    GymRunner.gymWon = (gym) => {
      GymRunner.originalGymWon(gym);
      GymRunner.startGym(gym);
    };
    AutoGym.optimizeConfigs();
    AutoGym.custom = true;
    return true;
  }

  static stop() {
    GymRunner.gymWon = GymRunner.originalGymWon;
    AutoGym.custom = false;
    AutoGym.restoreDefaultConfig();
  }

  static isRunning() {
    return AutoGym.custom;
  }

  static loadDefaultConfig(setImmediately = false) {
    const options = {
      showGymGoAnimation:
        Settings.getSetting("showGymGoAnimation").value ?? true,
      showCurrencyGainedAnimation:
        Settings.getSetting("showCurrencyGainedAnimation").value ?? true,
      showCurrencyLostAnimation:
        Settings.getSetting("showCurrencyLostAnimation").value ?? true,
    };
    if (setImmediately) {
      AutoGym.options = options;
    }
    return options;
  }

  static restoreDefaultConfig() {
    Settings.getSetting("showGymGoAnimation").set(
      AutoGym.options.showGymGoAnimation
    );
    Settings.getSetting("showCurrencyGainedAnimation").set(
      AutoGym.options.showCurrencyGainedAnimation
    );
    Settings.getSetting("showCurrencyLostAnimation").set(
      AutoGym.options.showCurrencyLostAnimation
    );
  }

  static optimizeConfigs() {
    Settings.getSetting("showGymGoAnimation").set(false);
    Settings.getSetting("showCurrencyGainedAnimation").set(false);
    Settings.getSetting("showCurrencyLostAnimation").set(false);
  }
}

window.addEventListener("beforeunload", () => {
  AutoGym.restoreDefaultConfig();
});
