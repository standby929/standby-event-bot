export interface EventOption {
  label: string;
  roleId: string | null;
  roleName: string | null;
  users: string[];
  maxUsers?: number;
}

export interface StandbyEvent {
  title: string;
  description?: string | null;
  channelId: string;
  start: string;
  end: string;
  options: EventOption[];
  messageId?: string;
}
