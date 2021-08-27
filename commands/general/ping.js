const i18n = require("i18n");

const { editCommandReply } = require("../../functions/load");

module.exports = {
  name: "ping",
  runPermissions: ["EMBED_LINKS", "SEND_MESSAGES"],
  description: i18n.__("ping.description"),
  execute(interaction, guildData, channelData, client, receivedTime) {
    let color = channelData.color ? channelData.color : guildData.color;
    interaction.reply("wait...").then(async (sent) => {
      //Test event sender
      if (interaction.commandName) sent = await interaction.fetchReply();
      let websocketShardsHeartbeat = [];
      interaction.client.ws.shards.each((shard) =>
        websocketShardsHeartbeat.push(
          `Shard(${shard.id}): ${Math.round(shard.ping)}ms`
        )
      );
      let data = {
        content: null, //Clear the message content
        embeds: [
          {
            color: `${color}`,
            description: i18n.__mf("ping.embed.description", {
              roundtripLatency:
                sent.createdTimestamp - interaction.createdTimestamp,
              listenerLatency: receivedTime - interaction.createdTimestamp,
              websocketShardsHeartbeat: websocketShardsHeartbeat.join("\n"),
            }),
          },
        ],
      };
      editCommandReply(interaction, data, sent).catch((error) => {
        console.warn(
          `An error occurred whilst editing reply in '${interaction.channel.name}'`
        );
        console.error(error);
        if (interaction.commandName)
          interaction.followUp(
            i18n.__mf("error.editingMessage", {
              channel: interaction.channel.id,
              errorMessage: error,
            })
          );
        else
          interaction.reply(
            i18n.__mf("error.editingMessage", {
              channel: interaction.channel.id,
              errorMessage: error,
            })
          );
      });
    });
  },
};
