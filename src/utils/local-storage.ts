import type { z } from "zod";

export function localStorageReadJson<T>(key: string, defaultValue: T, schema: z.ZodType<T>): T {
    try {
        const value = localStorage.getItem(key);
        if (value !== null) {
            const input: unknown = JSON.parse(value);
            const result = schema.safeParse(input);
            if (result.success) {
                return result.data;
            }
        }
    } catch {
        return defaultValue;
    }
    return defaultValue;
}

export function localStorageWriteJson(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        return;
    }
}
