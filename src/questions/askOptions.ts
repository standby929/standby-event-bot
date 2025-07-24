import { DMChannel, Guild } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';

export async function askOptions(
  dm: DMChannel,
  userId: string,
  guild: Guild,
  event: StandbyEvent
): Promise<void> {
  const roles = await guild.roles.fetch();
  const filteredRoles = roles.filter(r => r.name !== '@everyone' && !r.managed);

  const roleList = filteredRoles.map(role => `- ${role.name}`).join('\n');
  await dm.send(`📜 Elérhető szerepkörök:\n${roleList}\n\nAdj meg válaszopciókat a következő formátumban:\n\`válasz szöveg | szerepkör | max létszám\`\nBármelyik mező kihagyható. Írd be, hogy \`Kész\` ha végeztél.`);

  event.options = [];

  while (true) {
    const input = await askQuestion(dm, userId, '➕ Új válaszopció:');
    if (!input) {
      await dm.send('❌ Nem kaptam választ. Kiléptem.');
      throw new Error('no-response');
    }

    if (input.toLowerCase() === 'kész') break;

    const parts = input.split('|').map(x => x.trim());
    const labelRaw = parts[0];
    const roleNameRaw = parts[1];
    const maxRaw = parts[2];

    if (!labelRaw) {
      await dm.send('⚠️ A válasz szöveg nem lehet üres.');
      continue;
    }

    if (event.options.some(opt => opt.label.toLowerCase() === labelRaw.toLowerCase())) {
      await dm.send('⚠️ Már van ilyen opció. Adj meg újat.');
      continue;
    }

    let roleId: string | null = null;
    let roleDisplay = '*mindenki*';

    if (roleNameRaw) {
      const matchedRole = filteredRoles.find(role => role.name.toLowerCase() === roleNameRaw.toLowerCase());
      if (!matchedRole) {
        await dm.send(`❌ Nem található ilyen szerepkör: ${roleNameRaw}`);
        continue;
      }
      roleId = matchedRole.id;
      roleDisplay = matchedRole.name;
    }

    let maxUsers: number | undefined = undefined;
    if (maxRaw) {
      const parsedMax = parseInt(maxRaw, 10);
      if (isNaN(parsedMax) || parsedMax <= 0) {
        await dm.send('⚠️ A maximális létszámnak pozitív egész számnak kell lennie.');
        continue;
      }
      maxUsers = parsedMax;
    }

    event.options.push({
      label: labelRaw,
      roleId,
      roleName: roleId ? roleDisplay : null,
      maxUsers,
      users: []
    });

    await dm.send(`✅ Hozzáadva: ${labelRaw} (${roleDisplay}${maxUsers ? `, max ${maxUsers} fő` : ''})`);
  }
}
