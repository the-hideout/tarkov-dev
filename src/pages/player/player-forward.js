import { useParams, useNavigate } from 'react-router-dom';

function PlayerForward() {
    const params = useParams();
    const navigate = useNavigate();
    navigate('/players/regular/'+params.accountId);
}

export default PlayerForward;
