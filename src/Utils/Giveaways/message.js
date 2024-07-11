const { EmbedBuilder, Colors } = require("discord.js");
const { emojis, botCustom } = require(`../../config`);

module.exports = {
  giveaway: "🎉🎉 Herkese merhaba, çekiliş başladı! 🎉🎉", // Content
  giveawayEnded: "⏱️ **ÇEKİLİŞ SONA ERDİ** ⏱️",
  giveawayEndedButton: "Çekilişe git",
  title: "{this.prize}", // Title
  inviteToParticipate: "### Katılmak için 🎉 ile tepki verin!", // Description
  winMessage: {
    content: "🎉 Tebrikler, {winners}!",
    embed: new EmbedBuilder()
      .setAuthor({ name: "🎉 Çekiliş Sonucu 🎉" })
      .setDescription(
        `
            **__Çekiliş__**;
            {winners}, **[{this.prize}]({this.messageURL})** kazandınız!

            **__Çekilişi Oluşturan:__**;
            {this.hostedBy}
            `
      )
      .setColor(Colors.Blue),
  },
  drawing: `Çekiliş: {timestamp-relative} (⏱️) ({timestamp-default})`, // Description 1
  hostedBy: `Sponsor: {this.hostedBy}`, // Description 2
  dropMessage: "İlk 🎉 ile tepki veren ol!",
  embedFooter: "{this.winnerCount} kazanan(lar)",
  noWinner: `Çekiliş iptal edildi, geçerli katılım yok.`,
  winners: `Kazanan(lar):`,
  endedAt: "Bitiş tarihi",
  participants: `Katılımcı Sayısı: **{participants}**\nSon Katılan Üye {member}`,
};
