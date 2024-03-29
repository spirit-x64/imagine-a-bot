const { Schema, model } = require("mongoose");

module.exports = model(
  "guilds",
  new Schema({
    _id: { type: String, required: true },

    color: { type: String, default: "#000000" },
    language: { type: String, default: "en" },

    messages: {
      channel: String,
      openTicket: String,
    },

    tickets: {
      mode: String,
      counter: { type: Number },
      parent: String,
      channel: String,
      cooldown: Number,
      options: [
        {
          label: String,
          value: String,
          description: String,
        },
      ],
    },

    channels: {
      autoThreads: {
        ids: [String],
        options: [
          { names: String, autoArchiveDuration: Number, autoDelete: Boolean },
        ],
      },
      slowmode: {
        ids: [String],
        options: [{ timeout: Number }],
      },
      autoCrosspost: [String],
      blacklist: [String],
    },

    roles: {
      sticky: [String],
      supportTeam: String,
      moderators: [String],
    },
  })
);
