const configurationVisualConfig = () => {
  const tr = document.createElement("tr");
  tr.classList.add("row");
  tr.style.margin = "0px";
  tr.appendChild(createConfButton("Auto Chest Dungeon", AutoChestDungeon));
  tr.appendChild(createConfButton("Auto Battle Dungeon", AutoBattleDungeon));
  tr.appendChild(createConfButton("Auto Battle Frontier", AutoFrontier));
  tr.appendChild(createConfButton("Auto Clicker", AutoClicker));

  document
    .querySelector("#battleContainer > div.card-header.p-0 > table > tbody")
    .appendChild(tr);
};

const createConfButton = (text, runner) => {
  const td = document.createElement("td");
  td.classList.add("col");
  td.style.paddingLeft = "4px";
  td.style.paddingRight = "4px";
  const button = document.createElement("button");
  button.style.width = "100%";
  button.style.height = "100%";
  button.style.borderRadius = "16px";
  button.style.backgroundColor = runner.isRunning() ? "green" : "red";
  button.style.color = "white";
  button.onclick = () => {
    if (runner.isRunning()) {
      runner.stop();
      button.style.backgroundColor = "red";
    } else {
      runner.start();
      button.style.backgroundColor = "green";
    }
  };
  button.innerHTML = text;
  td.appendChild(button);
  return td;
};

setTimeout(configurationVisualConfig, 1000);
