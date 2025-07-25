import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Interaction } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { StandbyEvent } from './types/eventTypes';
import { askChannel } from './questions/askChannel';
import { askTitle } from './questions/askTitle';
import { askStartTime } from './questions/askStartTime';
import { askEndTime } from './questions/askEndTime';
import { askDescription } from './questions/askDescription';
import { askOptions } from './questions/askOptions';
import { postEventMessage } from './utils/postEventMessage';
import { handleButtonInteraction } from './utils/handleButtonInteraction';
import { loadEventsFromFiles } from './utils/persistence';
import { cleanupOldEvents } from './utils/cleanupOldEvents';
import { i18next, initI18n } from './i18n';

dotenv.config();

// Clean up expired event json files once a day
setInterval(() => {
  cleanupOldEvents();
}, 1000 * 60 * 60 * 24);

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;
const GUILD_ID = process.env.GUILD_ID!;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
});

let activeEvents = new Map<string, StandbyEvent>();

client.once('ready', async () => {
  console.log(`✅ Bot is ready as ${client.user?.tag}`);
  activeEvents = await loadEventsFromFiles();
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.isButton()) {
    await handleButtonInteraction(interaction, activeEvents);
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'standby-event') return;

  const lang = interaction.options.getString('language') || 'hu';
  const localesDir = path.join(__dirname, '../locales');
  const availableLanguages = fs.readdirSync(localesDir).map(file => file.replace('.json', ''));
  const selectedLang = availableLanguages.includes(lang) ? lang : 'hu';

  await initI18n(selectedLang);
  const t = (key: string, options?: any) => i18next.t(key, { lng: selectedLang, ...options });

  try {
    await interaction.reply({
      content: t('dm.start') as string,
      ephemeral: true,
    });

    const dm = await interaction.user.createDM();
    const guild = await client.guilds.fetch(GUILD_ID);
    const event: StandbyEvent = {
      title: '',
      description: null,
      channelId: '',
      start: '',
      end: '',
      options: [],
      createdBy: '',
    };

    await askChannel(dm, interaction.user.id, guild, event);
    await askTitle(dm, interaction.user.id, event);
    await askStartTime(dm, interaction.user.id, event);
    await askEndTime(dm, interaction.user.id, event);
    await askDescription(dm, interaction.user.id, event);
    await askOptions(dm, interaction.user.id, guild, event);

    await postEventMessage(dm, guild, interaction.user.username, event, activeEvents);
  } catch (err) {
    console.error(`[Error creating event]:`, err);
    const errorMessage = i18next.t('error.general', { lng: selectedLang });
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
});

(async () => {
  await initI18n('hu');

  const standbyCommand = new SlashCommandBuilder()
    .setName('standby-event')
    .setDescription(i18next.t('common.start') || 'Esemény létrehozása privátban')
    .addStringOption(option =>
      option
        .setName('language')
        .setDescription(i18next.t('common.availableLangs') || 'Nyelv (pl. hu, en)')
        .setRequired(false),
    );

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('📡 Registering slash command...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: [standbyCommand.toJSON()],
    });
    console.log('✅ Slash command registered.');
  } catch (error) {
    console.error('❌ Failed to register command:', error);
  }

  await client.login(TOKEN);

  // We need this hack to mislead the cloud providers if we want to deploy it as a web service...
  await import('./server');
})();
