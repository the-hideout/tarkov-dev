import seasonDetails from "../data/season-details.json";

export default seasonDetails;

export function getCurrentSeason() {
    return seasonDetails.find((season) => {
        const now = new Date();
        const start = new Date(season.start);
        const end = new Date(season.end);
        return now >= start && now <= end;
    });
}

export function getSeasonDaysRemaining() {
    const currentSeason = getCurrentSeason();
    if (!currentSeason) {
        return 0;
    }
    const end = new Date(currentSeason.end);
    const now = new Date();
    const remainingDays = Math.round((end - now) / (1000 * 60 * 60 * 24));
    return remainingDays;
}
