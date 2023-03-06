const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('spank-my-rank')
		.setDescription('Gets Rocket League Ranked Stats For A Given Player. Limit 5 times/day FOR THE WHOLE SERVER.').addStringOption(option =>
			option
				.setName('player')
				.setDescription('The Player\'s Rocket League Username')
        .setRequired(true)),
	async execute(interaction) {

    const player = interaction.options.getString('player');

    console.log('player: ', player);

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'RapidAPI Playground',
        'Accept-Encoding': 'identity',
        'X-RapidAPI-Key': `${process.env.RAPID_API_KEY}`,
        'X-RapidAPI-Host': 'rocket-league1.p.rapidapi.com'
      }
    };

    // @ts-ignore
    const res = await request(`https://rocket-league1.p.rapidapi.com/ranks/${player}`, options);
    console.log('res: ', res);

    let embed;

    if (res.statusCode === 429) {
      embed = new EmbedBuilder()
      .setColor(0x2B8E93)
      .setTitle('Too many requests, fucker. I said only 5 per day.')
      .addFields(
        { name: 'Why?', value: 'Look, I\'m not the frickin\' Rocket League Ambassador of Explanations. I\'m just a programmer using what tools I have. So take this shit up with Rocket League or send me $75.00 USD a month and you can look up players as many times as you want.'}
      )

    } else {
      const { ranks } = await res.body.json();

      console.log('ranks: ', ranks);

      if (!ranks.length) {
        return interaction.editReply(`No results found for **${player}**.`);
      }

      const playlists = ranks.slice(0, 3);

      const [ ones, twos, threes ] = playlists;

      console.log('playlists', playlists);
      console.log('check: ', ones, twos, threes);
      
      embed = new EmbedBuilder()
      .setColor(0x2B8E93)
      .setTitle(player)
      .addFields(
        { name: 'Ones', value: `
          Rank: ${ones.rank}
          Division: ${ones.division}
          Played: ${ones.played}
          Streak: ${ones.streak}
          Match Making Rank: ${ones.mmr}
        `
      },
        { name: 'Twos', value: `
        Rank: ${twos.rank}
        Division: ${twos.division}
        Played: ${twos.played}
        Streak: ${twos.streak}
        Match Making Rank: ${twos.mmr}
      `
      },
        { name: 'Threes', value: `
        Rank: ${threes.rank}
        Division: ${threes.division}
        Played: ${threes.played}
        Streak: ${threes.streak}
        Match Making Rank: ${threes.mmr}
      `
      }
      )
    }

    // THIS WORKS WITH WEATHER API. IT SHOULD WITH ROCKET LEAGUE TOO
    await interaction.deferReply();
    interaction.editReply({ embeds: [embed] });
	},
};