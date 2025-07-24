type EventUser = {
  id: string;
  name: string;
};

export interface EventOption {
  label: string;
  roleId: string | null;
  roleName: string | null;
  users: EventUser[];
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
  createdBy: string;
}
