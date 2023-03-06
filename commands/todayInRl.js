const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
require('dotenv').config();


// ! Just go over this all slowly. Some things are not destructuring variables properly to return, while the API may be over used. Try again with a fucking dummy API and go from there.

module.exports = {
	data: new SlashCommandBuilder()
		.setName('today-in-rl')
		.setDescription('Gathers info about happenings in Rocket League today. Limit 5 times/day FOR THE WHOLE SERVER.'),
	async execute(interaction) {

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'RapidAPI Playground',
        'Accept-Encoding': 'identity',
        'X-RapidAPI-Key': `${process.env.RAPID_API_KEY_TWO}`,
        'X-RapidAPI-Host': 'rocket-league1.p.rapidapi.com'
      }
    };

    // @ts-ignore
    const populationRes = request('https://rocket-league1.p.rapidapi.com/population', options);
    // @ts-ignore
    const shopRes = request('https://rocket-league1.p.rapidapi.com/shops/featured', options);
    // @ts-ignore
    const tournamentRes = request('https://rocket-league1.p.rapidapi.com/tournaments/us-west', options);

    const results = await Promise.all([populationRes, shopRes, tournamentRes]);

    console.log('FUCKING RESULTS no .json(): ', results);

  results.forEach((res, i) => {
      const data = res.body.json();
      console.log(`Not awaiting ${i}: `, data);
    });

    results.forEach(async (res, i) => {
      const data = await res.body.json();
      console.log(`Awaiting (${i}: `, data);
    });

    let embed;
    
    // console.log('PD: ', populationData);
    // console.log('SD: ', shopData);
    // console.log('TD: ', tournamentData);
    console.log('key one: ', process.env.RAPID_API_KEY);
    console.log('key two: ', process.env.RAPID_API_KEY_TWO);


      let populationString;
      // @ts-ignore
      populationString = `Total Population: ${populationData.online}\n`
      // @ts-ignore
      populationData.playlists.forEach(playlist => {
        populationString += `${playlist.name}: ${playlist.population}\n`
      })

      let shopString = '';
      // @ts-ignore
      shopData.shop.forEach(item => {
        shopString += `Item: ${item.paint || ''} ${item.cert || ''} ${item.name} Quality: ${item.quality} Price: ${item.price}\n`;
      })

      let tournamentString = '';
      // @ts-ignore
      tournamentData.shop.forEach(tourney => {
        let type;
        if (tourney.players === 1) {
          type = 'Ones'
        } else if (tourney.players === 2) {
          type = 'Twos'
        } else {
          type = 'Threes'
        }

        const formattedTime = new Intl.DateTimeFormat('en-us', { hour: 'numeric' }).format(new Date(tourney.starts))

        tournamentString += `Tournament: ${type} Starts At: ${formattedTime} Mode: ${tourney.mode}\n`;
      })
      
      embed = new EmbedBuilder()
      .setColor(0x2B8E93)
      .setTitle('Today In Rocket League')
      .addFields(
        { name: 'Population', value: `${populationString}`},
        { name: 'Shop', value: `${shopString}`},
        { name: 'Tournaments (US-West)', value: `${tournamentString}` }
      )

    await interaction.deferReply();
    interaction.editReply({ embeds: [embed] });
	},
};