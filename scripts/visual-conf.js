const configurationVisualConfig = () => {
  const div = document.createElement("div");
  div.classList.add("card");
  div.style.overflowX = "auto";
  const table = document.createElement("table");
  div.appendChild(table);
  table.classList.add("table");
  table.classList.add("table-bordered");
  table.classList.add("table-striped");
  table.classList.add("m-0");
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);
  const tr = document.createElement("tr");
  tr.appendChild(createConfButton("Auto Chest Dungeon", AutoChestDungeon));
  tr.appendChild(createConfButton("Auto Battle Dungeon", AutoBattleDungeon));
  tr.appendChild(createConfButton("Auto Battle Frontier", AutoFrontier));
  tr.appendChild(createConfButton("Auto Clicker", AutoClicker));
  table.appendChild(tr);

  document
    .querySelector("#battleContainer > div.card-header.p-0")
    .appendChild(div);
};

const createConfButton = (text, runner) => {
  const td = document.createElement("td");
  td.classList.add("p-1");
  td.classList.add("tight");
  const button = document.createElement("button");
  button.classList.add("btn");
  button.classList.add("btn-sm");
  button.classList.add("btn-block");
  button.classList.add(runner.isRunning() ? "btn-success" : "btn-danger");
  button.style.height = "100%";
  button.onclick = () => {
    if (runner.isRunning()) {
      runner.stop();
      button.classList.remove("btn-success");
      button.classList.add("btn-danger");
    } else {
      const runStarted = runner.start();
      if (!runStarted) {
        return;
      }
      button.classList.remove("btn-danger");
      button.classList.add("btn-success");
    }
  };
  button.innerHTML = text;
  td.appendChild(button);
  return td;
};

setTimeout(configurationVisualConfig, 1000);
