export function getSeasonDaysRemaining(season) {
    if (!season) {
        return 0;
    }
    const end = new Date(season.end);
    const now = new Date();
    const remainingDays = Math.round((end - now) / (1000 * 60 * 60 * 24));
    return remainingDays;
}
