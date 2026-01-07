import { useEffect, useRef, useState } from "react";

const contributorCache = {};

function normalizeContributors(rawContributors = []) {
    return rawContributors
        .filter((contributor) => contributor?.type === "User")
        .map((contributor) => ({
            login: contributor.login,
            html_url: contributor.html_url,
            avatar_url: contributor.avatar_url,
            contributions: contributor.contributions,
        }));
}

export default function useRepositoryContributors(repository) {
    const [contributors, setContributors] = useState(() => contributorCache[repository] ?? []);
    const [loading, setLoading] = useState(() => Boolean(repository) && !contributorCache[repository]);
    const [error, setError] = useState(null);
    const repoRef = useRef(repository);

    useEffect(() => {
        repoRef.current = repository;
    }, [repository]);

    useEffect(() => {
        if (!repository) {
            setContributors([]);
            setLoading(false);
            setError(null);
            return;
        }

        if (contributorCache[repository]) {
            setContributors(contributorCache[repository]);
            setLoading(false);
            setError(null);
            return;
        }

        const controller = new AbortController();
        let isActive = true;

        async function fetchContributors() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`https://api.github.com/repos/${repository}/contributors`, {
                    signal: controller.signal,
                    headers: { Accept: "application/vnd.github+json" },
                });

                if (!response.ok) {
                    throw new Error(`GitHub responded with ${response.status}`);
                }

                const repoContributors = normalizeContributors(await response.json());

                contributorCache[repository] = repoContributors;

                if (isActive && repoRef.current === repository) {
                    setContributors(repoContributors);
                    setLoading(false);
                }
            } catch (fetchError) {
                if (isActive && repoRef.current === repository) {
                    if (fetchError.name !== "AbortError") {
                        setError(fetchError);
                        setLoading(false);
                    }
                }
            }
        }

        fetchContributors();

        return () => {
            isActive = false;
            controller.abort();
        };
    }, [repository]);

    return {
        contributors,
        loading,
        error,
    };
}
