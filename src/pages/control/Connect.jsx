/* eslint-disable no-restricted-globals */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { enableConnection, setControlId } from "../../features/sockets/socketsSlice.js";
import { useTranslation } from "react-i18next";

function Connect() {
    const { t } = useTranslation();

    const [connectionText, setConnectionText] = useState(t("Connect"));
    const controlId = useSelector((state) => state.sockets.controlId);
    let navigate = useNavigate();
    const inputRef = useRef(null);
    const dispatch = useDispatch();

    const handleIDChange = (event) => {
        const tempConnectID = event.target.value.trim().toUpperCase().substring(0, 4);
        dispatch(setControlId(tempConnectID));
    };

    const handleConnectClick = (event) => {
        if (controlId.length !== 4) {
            inputRef.current.focus();

            return true;
        }

        setConnectionText(`${t("Connected to")} ${controlId}`);
        dispatch(enableConnection());

        navigate(`/control/`);
    };

    return (
        <div className="connection-wrapper">
            <input
                maxLength="4"
                minLength="4"
                name="session-id"
                onChange={handleIDChange}
                placeholder={t("id to control")}
                ref={inputRef}
                type="text"
            />
            <input
                // disabled = {!socketConnected}
                onClick={handleConnectClick}
                type="submit"
                value={connectionText}
            />
        </div>
    );
}

export default Connect;
