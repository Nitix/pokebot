let startFrontier = (forceStart = false) => {
  if (forceStart) {
    stop = false;
  }
  if (stop) {
    return;
  }
  const button = document.querySelector(
    "#battleFrontierInformation > div.card-body.text-center > a:nth-child(3)"
  );
  if (button) {
    button.click();
  }
  setTimeout(startFrontier, 30000);
};
