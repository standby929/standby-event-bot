import { DMChannel, Guild } from 'discord.js';
import { askQuestion } from '../utils/askQuestion';
import { StandbyEvent } from '../types/eventTypes';
import i18next from 'i18next';

export async function askOptions(dm: DMChannel, userId: string, guild: Guild, event: StandbyEvent): Promise<void> {
  const roles = await guild.roles.fetch();
  const filteredRoles = roles.filter(r => r.name !== '@everyone' && !r.managed);

  const roleList = filteredRoles.map(role => `- ${role.name}`).join('\n');
  await dm.send(i18next.t('askOptions.intro', { roleList }));

  event.options = [];

  while (true) {
    const input = await askQuestion(dm, userId, i18next.t('askOptions.prompt'));
    if (!input) {
      await dm.send(i18next.t('error.noResponse'));
      throw new Error('no-response');
    }

    if (input.toLowerCase() === 'kész') break;

    const parts = input.split('|').map(x => x.trim());
    const labelRaw = parts[0];
    const roleNameRaw = parts[1];
    const maxRaw = parts[2];

    if (!labelRaw) {
      await dm.send(i18next.t('askOptions.emptyLabel'));
      continue;
    }

    if (event.options.some(opt => opt.label.toLowerCase() === labelRaw.toLowerCase())) {
      await dm.send(i18next.t('askOptions.duplicateLabel'));
      continue;
    }

    let roleId: string | null = null;
    let roleDisplay = i18next.t('askOptions.everyone');

    if (roleNameRaw) {
      const matchedRole = filteredRoles.find(role => role.name.toLowerCase() === roleNameRaw.toLowerCase());
      if (!matchedRole) {
        await dm.send(i18next.t('askOptions.roleNotFound', { role: roleNameRaw }));
        continue;
      }
      roleId = matchedRole.id;
      roleDisplay = matchedRole.name;
    }

    let maxUsers: number | undefined = undefined;
    if (maxRaw) {
      const parsedMax = parseInt(maxRaw, 10);
      if (isNaN(parsedMax) || parsedMax <= 0) {
        await dm.send(i18next.t('askOptions.invalidMax'));
        continue;
      }
      maxUsers = parsedMax;
    }

    event.options.push({
      label: labelRaw,
      roleId,
      roleName: roleId ? roleDisplay : null,
      maxUsers,
      users: [],
    });

    await dm.send(i18next.t('askOptions.added', { label: labelRaw, role: roleDisplay, max: maxUsers ?? '' }));
  }
}
