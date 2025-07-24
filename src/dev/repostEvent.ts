// dev/repostEvent.ts
import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { loadEventsFromFiles } from '../utils/persistence';
import { postEventMessage } from '../utils/postEventMessage';

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN!;
const USER_ID = '1349448237890670664';
const GUILD_ID = process.env.GUILD_ID!;
const EVENT_ID = '1397922100614004809';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
});

client.once('ready', async () => {
  console.log(`✅ Bejelentkezve mint ${client.user?.tag}`);

  const guild = await client.guilds.fetch(GUILD_ID);
  const user = await client.users.fetch(USER_ID);
  const dm = await user.createDM();

  const eventsMap = await loadEventsFromFiles();
  const event = eventsMap.get(EVENT_ID);

  if (!event) {
    console.error(`❌ Nincs ilyen esemény: ${EVENT_ID}`);
    process.exit(1);
  }

  await postEventMessage(dm, guild, 'Teszt render', event, eventsMap);
  client.destroy();
});

client.login(TOKEN);
