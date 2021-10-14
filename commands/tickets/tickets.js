const i18n = require("i18n");

module.exports = {
  name: "tickets",
  usage: "<channel> <support(role)> <mode{classic | threads}> [cooldown: 300]",
  administrators: true,
  guild: true,
  defer: true,
  permissions: ["ADMINISTRATOR"],
  runPermissions: ["EMBED_LINKS", "SEND_MESSAGES", "MANAGE_CHANNELS"],
  description: i18n.__("tickets.description"),
  options: [
    {
      type: 7,
      name: "open_tickets",
      description: "Where to send open ticket message",
      required: true,
    },
    {
      type: 8,
      name: "support",
      description: "Support Team",
      required: true,
    },
    {
      type: 3,
      name: "mode",
      description: "Classic: ticket = channel, Threads: ticket = thread",
      required: true,
      choices: [
        {
          name: "classic",
          value: "classic",
        },
        {
          name: "threads",
          value: "threads",
        },
      ],
    },
    {
      type: 4,
      name: "cooldown",
      description: "Open tickets cooldown in seconds",
    },
  ],
  async execute(interaction, Data) {
    let openTicketsChannel = interaction.options.getChannel("open_tickets");
    let supportRole = interaction.options.getRole("support");
    let mode = interaction.options.getString("mode");
    let cooldown = interaction.options.getInteger("cooldown");
    let followUpData = "";

    if (
      mode === "threads" &&
      ["NONE", "TIER_1"].includes(interaction.guild.premiumTier)
    )
      return interaction.editReply(
        "Tickets with threads only work in servers with tier2 & above"
      );

    if (!openTicketsChannel.isText())
      return interaction.editReply(
        "open_tickets channel must be a text based channel"
      );

    try {
      openTicketsChannel.send({
        content: "Press the button to create a ticket",
        components: [
          {
            components: [
              {
                label: "Create Ticket",
                customId: "create_ticket",
                style: "SECONDARY",
                emoji: "🎫",
                type: "BUTTON",
              },
            ],
            type: "ACTION_ROW",
          },
        ],
      });
    } catch (error) {
      console.error(error);
      return interaction.editReply(`**Error:**\n> ${error}`);
    }

    switch (mode) {
      case "threads":
        break;

      default:
        break;
    }

    let oldParent = await interaction.guild.channels.cache.get(
      Data.guild.tickets?.parent
    );
    let parent;

    if (
      (mode === "classic" && oldParent?.type === "GUILD_CATEGORY") ||
      (mode === "threads" && oldParent?.type === "GUILD_TEXT")
    ) {
      parent = oldParent;
      followUpData += `I found an old ${
        mode === "threads" ? "channel" : "category"
      } for tickets and i will use it, press create ${
        mode === "threads" ? "channel" : "category"
      } to create a new ${
        mode === "threads" ? "channel" : "category"
      } for messages\n\nImagine a create ${
        mode === "threads" ? "channel" : "category"
      } button`;
    } else {
      if (mode === "classic")
        parent = await interaction.guild.channels.create(`tickets-system`, {
          type: "GUILD_CATEGORY",
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: ["VIEW_CHANNEL"],
              allow: ["ATTACH_FILES"],
            },
            {
              id: interaction.client.user.id,
              allow: ["MANAGE_CHANNELS", "VIEW_CHANNEL", "SEND_MESSAGES"],
              type: "member",
            },
          ],
        });
      else
        parent = await interaction.guild.channels.create(`open-tickets`, {
          type: "GUILD_TEXT",
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: ["READ_MESSAGE_HISTORY", "SEND_MESSAGES"],
            },
            {
              id: supportRole.id,
              allow: ["READ_MESSAGE_HISTORY"],
              type: "role",
            },
            {
              id: interaction.client.user.id,
              allow: [
                "VIEW_CHANNEL",
                "READ_MESSAGE_HISTORY",
                "SEND_MESSAGES",
                "MANAGE_THREADS",
              ],
              type: "member",
            },
          ],
        });
    }

    let messagesChannel;

    let channel = await interaction.guild.channels.create(`open-tickets`, {
      type: "GUILD_TEXT",
      parent: parent,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ["VIEW_CHANNEL"],
        },
        {
          id: supportRole.id,
          allow: ["VIEW_CHANNEL"],
          type: "role",
        },
        {
          id: interaction.client.user.id,
          allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
          type: "member",
        },
      ],
    });

    if (
      interaction.guild.channels.cache.has(Data.guild.tickets.messages?.channel)
    ) {
      messagesChannel = interaction.guild.channels.cache.get(
        Data.guild.tickets.messages?.channel
      );
      followUpData +=
        "I found an old channel for messages and i will use it, press create messages channel to create a new channel for messages\n\n`Imagine a create messages channel button`";
    } else {
      messagesChannel = await interaction.guild.channels.create(`messages`, {
        type: "GUILD_TEXT",
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: ["VIEW_CHANNEL"],
          },
          {
            id: interaction.client.user.id,
            allow: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "SEND_MESSAGES"],
            type: "member",
          },
        ],
      });
    }

    let openTicketMessage = await messagesChannel.send(
      `New Ticket!! <@&${supportRole.id}> {{ticket.number}}`
    );
    openTicketMessage.reply(
      "Don't delete this message or the tickets sys will f\\*\\* up, use the `edit` command to edit the `openTicketMessage`"
    );

    Data.guild.tickets.mode = mode;
    Data.guild.tickets.counter = 1;
    Data.guild.tickets.parent = parent.id;
    Data.guild.tickets.channel = mode === "threads" ? parent.id : channel.id;
    Data.guild.tickets.cooldown = cooldown ? cooldown : 300;
    Data.guild.tickets.messages.channel = messagesChannel.id;
    Data.guild.tickets.messages.openTicket = openTicketMessage.id;
    Data.guild.roles.supportTeam = supportRole.id;
    Data.guild.save();
    await interaction.editReply("Created new ticket sys");
    if (followUpData) interaction.followUp(followUpData);
  },
};
