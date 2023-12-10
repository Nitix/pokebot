class AutoFrontier {
  static interval;

  static runFrontier() {
    const button = document.querySelector(
      "#battleFrontierInformation > div.card-body.text-center > a:nth-child(3)"
    );
    if (button) {
      button.click();
    }
  }

  static start() {
    AutoFrontier.runFrontier();
    if (AutoFrontier.interval) {
      return;
    }
    AutoFrontier.interval = setInterval(AutoFrontier.runFrontier, 30000);
  }

  static stop() {
    clearInterval(this.interval);
    this.interval = null;
  }

  static isRunning() {
    return !!this.interval;
  }
}
