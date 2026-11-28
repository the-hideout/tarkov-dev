import type { z } from "zod";
import type {
    gameModeSchema,
    gameModeSettingsSchema,
    levelSettingKeySchema,
    playerPositionSchema,
    skillKeySchema,
    stationKeySchema,
    tarkovTrackerDomainSchema,
    tarkovTrackerResponseSchema,
    traderKeySchema,
} from "#src/features/settings/contracts";

export type GameMode = z.infer<typeof gameModeSchema>;
export type TarkovTrackerDomain = z.infer<typeof tarkovTrackerDomainSchema>;
export type LoadingStatus = "idle" | "loading" | "succeeded" | "failed";
export type GameModeSettings = z.infer<typeof gameModeSettingsSchema>;
export type SettingValue = GameModeSettings[keyof GameModeSettings];
export type LevelSettingKey = z.infer<typeof levelSettingKeySchema>;
export type TraderKey = z.infer<typeof traderKeySchema>;
export type StationKey = z.infer<typeof stationKeySchema>;
export type SkillKey = z.infer<typeof skillKeySchema>;
export type PlayerPosition = z.infer<typeof playerPositionSchema>;
export type TarkovTrackerResponse = z.infer<typeof tarkovTrackerResponseSchema>;
