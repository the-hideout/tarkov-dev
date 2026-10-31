// @ts-check
import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "#src/hooks/redux";
import { enableConnection, setControlId } from "#src/features/sockets/socketsSlice";
import { useTranslation } from "react-i18next";

function Connect() {
    const { t } = useTranslation();

    const [connectionText, setConnectionText] = useState(t("Connect"));
    const controlId = useAppSelector((state) => state.sockets.controlId);
    let navigate = useNavigate();
    const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
    const dispatch = useAppDispatch();

    /** @param {import("react").ChangeEvent<HTMLInputElement>} event */
    const handleIDChange = (event) => {
        const tempConnectID = event.target.value.trim().toUpperCase().substring(0, 4);
        dispatch(setControlId(tempConnectID));
    };

    const handleConnectClick = () => {
        if (!controlId || controlId.length !== 4) {
            inputRef.current?.focus();

            return true;
        }

        setConnectionText(`${t("Connected to")} ${controlId}`);
        dispatch(enableConnection());

        navigate(`/control/`);
    };

    return (
        <div className="connection-wrapper">
            <input
                maxLength={4}
                minLength={4}
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
