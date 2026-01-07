import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PlayerForward() {
    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate("/players/regular/" + params.accountId);
        }, 500);
        return () => {
            clearTimeout(timeout);
        };
    }, [params, navigate]);
}

export default PlayerForward;
