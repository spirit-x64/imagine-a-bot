const { Collection } = require("discord.js");
const fs = require("fs");

async function loadButtons(client) {
  client.cache.buttons = new Collection();
  const buttonFolders = fs.readdirSync("./buttons");
  for (const folder of buttonFolders) {
    const buttonFiles = fs
      .readdirSync(`./buttons/${folder}`)
      .filter((file) => file.split(".").pop() === "js");
    for (const file of buttonFiles) {
      if (buttonFiles.length <= 0) {
        console.log("client couldn't find buttons in buttons folder.");
      } else {
        const button = require(`../buttons/${folder}/${file}`);
        if (button.disabled) continue;
        client.cache.buttons.set(button.customId, button);
      }
    }
  }
}

module.exports = {
  loadButtons,
};
