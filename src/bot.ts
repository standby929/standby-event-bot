import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  Interaction,
} from 'discord.js';
import dotenv from 'dotenv';
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

dotenv.config();

setInterval(() => {
  cleanupOldEvents();
}, 1000 * 60 * 60 * 24); // Clean up expired event json files once a day

const TOKEN = process.env.DISCORD_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;
const GUILD_ID = process.env.GUILD_ID!;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
});

const standbyCommand = new SlashCommandBuilder()
  .setName('standby-event')
  .setDescription('Esemény létrehozása privátban');

let activeEvents = new Map<string, StandbyEvent>();

client.once('ready', async () => {
  console.log(`✅ Bot bejelentkezve: ${client.user?.tag}`);
  activeEvents = await loadEventsFromFiles(); // ✅ async init
});

client.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.isButton()) {
    await handleButtonInteraction(interaction, activeEvents);
    return;
  }
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'standby-event') return;

  try {
    await interaction.reply({ content: 'Privátban folytatjuk az esemény létrehozását.', ephemeral: true });
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
    console.error('❌ Hiba az esemény létrehozás során:', err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Valami hiba történt.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Valami hiba történt.', ephemeral: true });
    }
  }
});

client.login(TOKEN);

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    console.log('📦 Slash parancs regisztrálása...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [standbyCommand.toJSON()] }
    );
    console.log('✅ Slash parancs regisztrálva.');
  } catch (error) {
    console.error('❌ Parancsregisztrációs hiba:', error);
  }
})();
