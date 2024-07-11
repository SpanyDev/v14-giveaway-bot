const {
    ActivityType,
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
    ApplicationCommandType,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const configFile = require('./config');
const consola = require('consola');
const AntiCrash = require('./Utils/Functions/AntiCrash.js');
const { embed } = require('./Utils/Functions/embed.js');


const client = new Client({
    intents: Object.values(GatewayIntentBits),
    partials: Object.values(Partials),
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true,
    },
    presence: {
        status: 'dnd',
        activities: [
            {
                name: 'with the APIa',
                type: ActivityType.Playing,
            },
        ],
    },
});

client.commands = new Collection();
client.context = new Collection();
client.config = configFile;
client.embed = embed;

require("./Utils/slashCommandsLoader.js")(client);
require("./Utils/eventsLoader.js")(client);

// ------------------ Giveaway ------------------ //

const { GiveawaysManager } = require("vante-giveaways");
const manager = new GiveawaysManager(client, {
  storage: "./src/Databases/giveaways.json",
  default: {
    embedColor: `${configFile.botCustom.color}`,
    buttonEmoji: "🎉",
    buttonStyle: ButtonStyle.Primary,
  },
});

client.giveawaysManager = manager;

client.giveawaysManager.on(
  "giveawayJoined",
  async (giveaway, member, interaction) => {
    if (interaction.replied) return;
    let joinedUser = client.users.cache.get(interaction.user.id);
    if (interaction.user.bot) return;

    const errEmbed = new EmbedBuilder()
      .setColor(configFile.botCustom.redColor)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    const successEmbed = new EmbedBuilder()
      .setColor(configFile.botCustom.greenColor)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.reply({
      embeds: [
        successEmbed.setDescription("You have successfully joined the giveaway.")
      ],
      ephemeral: true,
    });
  }
);

client.giveawaysManager.on(
  "giveawayLeaved",
  async (giveaway, member, interaction) => {
    const successEmbed = new EmbedBuilder()
      .setColor(configFile.botCustom.greenColor)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.reply({
      embeds: [
        successEmbed.setDescription(
          "You have successfully left the giveaway."
        )
      ],
      ephemeral: true,
    });
  }
);

AntiCrash()
client.login(client.config.token);
