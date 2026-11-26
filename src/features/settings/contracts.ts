import { z } from "zod";

export const gameModeSchema = z.enum(["regular", "pve", "pvp-season"]);
export const tarkovTrackerDomainSchema = z.enum(["tarkovtracker.io", "tarkovtracker.org"]);
export const pmcFactionSchema = z.enum(["NONE", "USEC", "BEAR"]);

// The game's playerLevels table currently contains levels 1 through 79.
export const MAX_PLAYER_LEVEL = 79;
export const playerLevelSchema = z.number().int().min(1).max(MAX_PLAYER_LEVEL);
export const levelInputSchema = z.string().trim().regex(/^\d+$/).transform(Number).pipe(playerLevelSchema);
const storedPlayerLevelSchema = z.union([playerLevelSchema, levelInputSchema]);
const nonnegativeIntegerSchema = z.number().int().nonnegative();
const storedNonnegativeInteger = (max: number) =>
    z
        .union([
            nonnegativeIntegerSchema,
            z.string().trim().regex(/^\d+$/).transform(Number).pipe(nonnegativeIntegerSchema),
        ])
        .pipe(nonnegativeIntegerSchema.max(max));

export function parseLevelInput(text: string): number | undefined {
    const result = levelInputSchema.safeParse(text);
    return result.success ? result.data : undefined;
}

export const traderLevelSchema = z.object({
    prapor: storedNonnegativeInteger(4).catch(4),
    therapist: storedNonnegativeInteger(4).catch(4),
    fence: storedNonnegativeInteger(1).catch(0),
    skier: storedNonnegativeInteger(4).catch(4),
    peacekeeper: storedNonnegativeInteger(4).catch(4),
    mechanic: storedNonnegativeInteger(4).catch(4),
    ragman: storedNonnegativeInteger(4).catch(4),
    jaeger: storedNonnegativeInteger(4).catch(4),
    ref: storedNonnegativeInteger(4).catch(4),
});

export const stationLevelSchema = z.object({
    "bitcoin-farm": storedNonnegativeInteger(3).catch(3),
    "booze-generator": storedNonnegativeInteger(1).catch(1),
    "christmas-tree": storedNonnegativeInteger(1).catch(1),
    "intelligence-center": storedNonnegativeInteger(3).catch(3),
    "lavatory": storedNonnegativeInteger(3).catch(3),
    "medstation": storedNonnegativeInteger(3).catch(3),
    "nutrition-unit": storedNonnegativeInteger(3).catch(3),
    "water-collector": storedNonnegativeInteger(3).catch(3),
    "workbench": storedNonnegativeInteger(3).catch(3),
    "solar-power": storedNonnegativeInteger(1).catch(0),
    "air-filtering-unit": storedNonnegativeInteger(1).catch(0),
    "cultist-circle": storedNonnegativeInteger(1).catch(0),
    "defective-wall": storedNonnegativeInteger(6).catch(0),
    "gear-rack": storedNonnegativeInteger(3).catch(0),
    "generator": storedNonnegativeInteger(3).catch(0),
    "gym": storedNonnegativeInteger(1).catch(0),
    "hall-of-fame": storedNonnegativeInteger(3).catch(0),
    "heating": storedNonnegativeInteger(3).catch(0),
    "illumination": storedNonnegativeInteger(3).catch(0),
    "library": storedNonnegativeInteger(1).catch(0),
    "rest-space": storedNonnegativeInteger(3).catch(0),
    "scav-case": storedNonnegativeInteger(1).catch(0),
    "security": storedNonnegativeInteger(3).catch(0),
    "shooting-range": storedNonnegativeInteger(3).catch(0),
    "stash": storedNonnegativeInteger(4).catch(0),
    "vents": storedNonnegativeInteger(3).catch(0),
    "weapon-rack": storedNonnegativeInteger(3).catch(0),
});

export const skillLevelSchema = z.object({
    "crafting": storedNonnegativeInteger(51).catch(0),
    "hideout-management": storedNonnegativeInteger(51).catch(0),
    "metabolism": storedNonnegativeInteger(51).catch(0),
});

export const traderKeySchema = traderLevelSchema.keyof();
export const stationKeySchema = stationLevelSchema.keyof();
export const skillKeySchema = skillLevelSchema.keyof();
export const levelSettingKeySchema = z.enum([
    ...traderKeySchema.options,
    ...stationKeySchema.options,
    ...skillKeySchema.options,
]);

export const gameModeSettingsSchema = z.object({
    playerLevel: storedPlayerLevelSchema.catch(72),
    pmcFaction: pmcFactionSchema.catch("NONE"),
    useTarkovTracker: z.boolean().catch(false),
    tarkovTrackerAPIKey: z.string().catch(""),
    completedQuests: z.array(z.string()).catch([]),
    failedQuests: z.array(z.string()).catch([]),
    tarkovTrackerModules: z.array(z.string()).catch([]),
    objectivesCompleted: z.array(z.string()).catch([]),
    objectivesCompletionProgress: z.record(z.string(), nonnegativeIntegerSchema).catch({}),
    minDogtagLevel: storedPlayerLevelSchema.catch(1),
    hideDogtagBarters: z.boolean().catch(false),
    ...traderLevelSchema.shape,
    ...stationLevelSchema.shape,
    ...skillLevelSchema.shape,
});

export function parseGameModeSettings(input: unknown, defaults = gameModeSettingsSchema.parse({})) {
    const record = z.record(z.string(), z.unknown()).safeParse(input);
    return gameModeSettingsSchema.parse({ ...defaults, ...(record.success ? record.data : {}) });
}

export const playerPositionSchema = z.object({
    map: z.string().nullable(),
    position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    rotation: z.number().optional(),
});

export const tarkovTrackerResponseSchema = z.object({
    data: z.object({
        tasksProgress: z.array(
            z.object({
                id: z.string(),
                complete: z.boolean().optional(),
                invalid: z.boolean().optional(),
                failed: z.boolean().optional(),
            }),
        ),
        taskObjectivesProgress: z.array(
            z.object({
                id: z.string(),
                complete: z.boolean().optional(),
                count: nonnegativeIntegerSchema.optional(),
            }),
        ),
        playerLevel: playerLevelSchema,
        pmcFaction: pmcFactionSchema,
        hideoutModulesProgress: z.array(z.object({ id: z.string(), complete: z.boolean().optional() })),
    }),
});
