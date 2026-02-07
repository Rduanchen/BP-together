export type ShareRole = "VIEWER" | "EDITOR";

export interface SettingsForm {
    sysHighAlert?: number;
    sysLowAlert?: number;
    diaHighAlert?: number;
    diaLowAlert?: number;
    pulseHighAlert?: number;
    pulseLowAlert?: number;
    sysHighWarn?: number;
    sysLowWarn?: number;
    diaHighWarn?: number;
    diaLowWarn?: number;
    pulseHighWarn?: number;
    pulseLowWarn?: number;
    reminderEnabled: boolean;
    reminderTime?: string;
    dailyTarget: number;
}

export interface ShareCode {
    code: string;
    expiresAt: string;
    role: ShareRole;
}

export interface UserInfo {
    id: string;
    name?: string;
    email: string;
}

export interface SharedWithMeItem {
    sharer: UserInfo;
    role: ShareRole;
    notificationsEnabled: boolean;
}

export interface SharedByMeItem {
    viewer: UserInfo;
    role: ShareRole;
}
