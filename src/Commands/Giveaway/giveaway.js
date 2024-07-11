const {
  PermissionFlagsBits,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
} = require("discord.js");
const { botCustom, emojis } = require("../../config");
const messages = require(`../../Utils/Giveaways/message`);
const ms = require("ms");

module.exports = {
  category: "çekiliş",
  data: new SlashCommandBuilder()
    .setName("çekiliş")
    .setDescription("Çekilşerinizi yönetirsiniz.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("oluştur")
        .setDescription("Çekiliş oluşturursunuz")
        .addStringOption((option) =>
          option
            .setName("süre")
            .setDescription("Çekiliş süresini belirtin.")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("kazananlar")
            .setDescription("Kazanan sayısını belirtin.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("ödül")
            .setDescription("Çekiliş ödülü.")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("sponsor")
            .setDescription("Çekilişi yapmaya aracı olan kişi")
            .setRequired(false)
        )
        .addChannelOption((option) =>
          option
            .setName("kanal")
            .setDescription("Çekilişin yapılacağı kanal")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("bitir")
        .setDescription("Çekişi sonlandırırsınız.")
        .addStringOption((option) =>
          option
            .setName("mesaj_id")
            .setDescription("Çekiliş mesaj id'si")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("yeniden-çek")
        .setDescription("Çekilişi yeniden yaparsınız.")
        .addStringOption((option) =>
          option
            .setName("mesaj_id")
            .setDescription("Çekiliş mesaj id'si")
            .setRequired(true)
        )
        .addStringOption((Option) =>
          Option.setName("kazananlar")
            .setDescription("Yeniden çekilecek kazanan sayısı")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("listele")
        .setDescription("Aktif çekilişleri listeler.")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  run: async (client, interaction) => {
    const { options } = interaction;
    const subcommand = options.getSubcommand();

    const errEmbed = new EmbedBuilder().setColor(botCustom.redColor).setFooter({
      text: `Komutu Kullanan: ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    });

    const successEmbed = new EmbedBuilder()
      .setColor(botCustom.greenColor)
      .setFooter({
        text: `Komutu Kullanan: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    if (subcommand === "oluştur") {
      const channel =
        interaction.options.getChannel("kanal") || interaction.channel;
      const hosted = interaction.options.getUser("sponsor");
      const duration = interaction.options.getString("süre");
      const winnerCount = interaction.options.getInteger("kazananlar");
      const prize = interaction.options.getString("ödül");

      if (isNaN(ms(duration))) {
        return interaction.reply({
          embeds: [
            errEmbed.setDescription("Lütfen geçerli bir süre girin!")
          ],
          ephemeral: true,
        });
      }

      if (winnerCount < 1) {
        return interaction.reply({
          embeds: [
            errEmbed
            .setDescription("Lütfen geçerli bir kazanan sayısı seçin! bire eşit veya büyük olmalıdır.")
          ],
          ephemeral: true,
        });
      }

      messages.inviteToParticipate = `### Katılmak için 🎉 ile tepki verin!`;
      messages.hostedBy = `Sponsor: {this.hostedBy}`;

      client.giveawaysManager.start(channel, {
        duration: ms(duration),
        winnerCount: parseInt(winnerCount),
        prize,
        hostedBy: hosted ? hosted : interaction.user,
        thumbnail: interaction.guild.iconURL({ dynamic: true }),
        messages,
      });

      await interaction.reply({
        embeds: [
          successEmbed.setDescription(
            `Giveaway ${channel} içinde başladı.`
          ),
        ],
        ephemeral: true,
      });
    }

    if (subcommand === "bitir") {
      const query = options.getString("mesaj_id");

      const giveaway =
        client.giveawaysManager.giveaways.find(
          (g) => g.prize === query && g.guildId === interaction.guild.id
        ) ||
        client.giveawaysManager.giveaways.find(
          (g) => g.messageId === query && g.guildId === interaction.guild.id
        );

      if (!giveaway) {
        return interaction.reply({
          embeds: [
            errEmbed.setDescription("Çekiliş bulunamadı.")
          ],
          ephemeral: true,
        });
      }

      if (giveaway.ended) {
        return interaction.reply({
          embeds: [
            errEmbed.setDescription("Çekiliş çoktan sona erdi.")
          ],
          ephemeral: true,
        });
      }

      client.giveawaysManager
        .end(giveaway.messageId)
        .then(async () => {
          await interaction.reply({
            embeds: [
              successEmbed.setDescription(`Çekiliş sona erdi.`),
            ],
            ephemeral: true,
          });
        })
        .catch((err) => {
          interaction.reply(
            `Bir hata oluştu, lütfen kontrol edip tekrar deneyin.\n\`${err}\``
          );
        });
    }

    if (subcommand === "yeniden-çek") {
      const query = options.getString("mesaj_id");
      const winnerCount = options.getString("kazananlar");

      const giveaway =
        client.giveawaysManager.giveaways.find(
          (g) => g.prize === query && g.guildId === interaction.guild.id
        ) ||
        client.giveawaysManager.giveaways.find(
          (g) => g.messageId === query && g.guildId === interaction.guild.id
        );

      if (!giveaway) {
        return interaction.reply({
          embeds: [
            errEmbed.setDescription("Çekiliş bulunamadı.")
          ],
          ephemeral: true,
        });
      }

      if (!giveaway.ended) {
        return interaction.reply({
          embeds: [
            errEmbed.setDescription("Çekiliş henüz sona ermedi.")
          ],
          ephemeral: true,
        });
      }

      if (isNaN(winnerCount)) {
        return interaction.reply({
          embeds: [
            errEmbed.setDescription("Lütfen geçerli bir kazanan sayısı girin!")
          ],
          ephemeral: true,
        });
      }

      client.giveawaysManager
        .reroll(giveaway.messageId, {
          ...(winnerCount && { winnerCount: parseInt(winnerCount) }),
        })
        .then(async () => {
          await interaction.reply({
            embeds: [
              successEmbed.setDescription(`Çekiliş tekrarlandı.`),
            ],
            ephemeral: true,
          });
        })
        .catch((err) => {
          interaction.reply(
            `Bir hata oluştu, lütfen kontrol edip tekrar deneyin.\n\`${err}\``
          );
        });
    }

    if (subcommand === "listele") {
      let giveaways = client.giveawaysManager.giveaways.filter(
        (g) => g.guildId === `${interaction.guild.id}` && !g.ended
      );

      if (!giveaways.some((e) => e.messageId)) {
        return interaction.reply({
          embeds: [
            errEmbed.setDescription("Aktif hediye yok.")
          ],
          ephemeral: true,
        });
      }

      let embed = new EmbedBuilder()
        .setTitle("🎉 Şu Anda Aktif Olan Çekilişler 🎉")
        .setColor(Colors.Blue)
        .setFooter({
          text: `Komutu Kullanan: ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await Promise.all(
        giveaways.map(async (x) => {
          embed.addFields({
            name: "Çekilişler:",
            value: `**Ödül:** **[${
              x.prize
            }](https://discord.com/channels/${x.guildId}/${x.channelId}/${
              x.messageId
            })**\n**Başlangıç:** <t:${(x.startAt / 1000).toFixed(
              0
            )}:R> (<t:${(x.startAt / 1000).toFixed(0)}:f>)\n
            **Bitiş:** <t:${(x.endAt / 1000).toFixed(0)}:R> (<t:${(
              x.endAt / 1000
            ).toFixed(0)}:f>)`,
          });
        })
      );

      await interaction.reply({ embeds: [embed] });
    }
  },
};
