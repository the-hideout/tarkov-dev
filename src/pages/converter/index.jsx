import { useEffect, useState } from "react";
import { Icon } from "@mdi/react";
import { mdiCashSync, mdiCurrencyRub, mdiCurrencyUsd, mdiCurrencyEur } from "@mdi/js";
import { useTranslation } from "react-i18next";

import SEO from "../../components/SEO.jsx";
import { InputFilter } from "../../components/filter/index.jsx";

import useItemsData from "../../features/items/index.js";

import itemSearch from "../../modules/item-search.js";

import useKeyPress from "../../hooks/useKeyPress.jsx";

import "./index.css";

function Converter() {
    const { t } = useTranslation();

    const [RUBFilter, setRUBFilter] = useState();
    const [USDFilter, setUSDFilter] = useState();
    const [EURFilter, setEURFilter] = useState();
    const [USDRate, setUSDRate] = useState(143);
    const [EURRate, setEURRate] = useState(159);
    const { data: items } = useItemsData();

    const enterPress = useKeyPress("Enter");

    useEffect(() => {
        let dollarConversion;
        const dollarsearch = itemSearch(items, "dollars");
        const dollarItem = dollarsearch.find((item) => item.normalizedName === "dollars");
        if (dollarItem) {
            dollarConversion = dollarItem.buyForBest.price;
        }
        setUSDRate(dollarConversion);

        let euroConversion;
        const euroSearch = itemSearch(items, "euros");
        const euroItem = euroSearch.find((item) => item.normalizedName === "euros");
        if (euroItem) {
            euroConversion = euroItem.buyForBest.price;
        }
        setEURRate(euroConversion);
    }, [items, setEURRate, setUSDRate]);

    useEffect(() => {
        if (enterPress) {
            resetInput();
        }
    }, [enterPress]);

    function exchangeRate() {
        const exchangeRates = {
            RUB: { USD: 1 / USDRate, EUR: 1 / EURRate },
            USD: { EUR: USDRate / EURRate, RUB: USDRate },
            EUR: { USD: EURRate / USDRate, RUB: EURRate },
        };
        return exchangeRates;
    }

    function inputFilter(fromCurrency, amount) {
        if (fromCurrency === "RUB") {
            setRUBFilter(amount);
            convertCurrency(fromCurrency, amount);
        } else if (fromCurrency === "USD") {
            setUSDFilter(amount);
            convertCurrency(fromCurrency, amount);
        } else if (fromCurrency === "EUR") {
            setEURFilter(amount);
            convertCurrency(fromCurrency, amount);
        }
    }

    function convertCurrency(fromCurrency, amount) {
        if (fromCurrency === "RUB") {
            let convertedAmount = Math.floor(amount * exchangeRate()[fromCurrency]["USD"]);
            setUSDFilter(convertedAmount);
            convertedAmount = Math.floor(amount * exchangeRate()[fromCurrency]["EUR"]);
            setEURFilter(convertedAmount);
        } else if (fromCurrency === "USD") {
            let convertedAmount = Math.floor(amount * exchangeRate()[fromCurrency]["EUR"]);
            setEURFilter(convertedAmount);
            convertedAmount = Math.floor(amount * exchangeRate()[fromCurrency]["RUB"]);
            setRUBFilter(convertedAmount);
        } else if (fromCurrency === "EUR") {
            let convertedAmount = Math.floor(amount * exchangeRate()[fromCurrency]["USD"]);
            setUSDFilter(convertedAmount);
            convertedAmount = Math.floor(amount * exchangeRate()[fromCurrency]["RUB"]);
            setRUBFilter(convertedAmount);
        }
    }

    function resetInput() {
        setRUBFilter("");
        setUSDFilter("");
        setEURFilter("");
    }

    return [
        <SEO
            title={`${t("Converter")} - ${t("Escape from Tarkov")} - ${t("Tarkov.dev")}`}
            description={t(
                "converter-page-description",
                "Search Escape from Tarkov players. Convert from one currancy to another.",
            )}
            key="seo-wrapper"
        />,
        <div className={"page-wrapper"} key="converter-page-wrapper">
            <div className="converter-headline-wrapper" key="converter-headline">
                <h1 className="converter-page-title">
                    <Icon path={mdiCashSync} size={1.5} className="icon-with-text" />
                    {t("Converter")}
                </h1>
            </div>
            <div>
                <p>{t("Convert one currency to another")}</p>
            </div>
            <div className="currency-input">
                <InputFilter
                    value={RUBFilter}
                    placeholder={"0"}
                    type="number"
                    min={0}
                    onChange={(event) => {
                        inputFilter("RUB", event.target.value);
                    }}
                />
                <Icon path={mdiCurrencyRub} size={1.5} className="icon-with-text" />
            </div>
            <div className="currency-input">
                <InputFilter
                    value={USDFilter}
                    placeholder={"0"}
                    type="number"
                    min={0}
                    onChange={(event) => {
                        inputFilter("USD", event.target.value);
                    }}
                />
                <Icon path={mdiCurrencyUsd} size={1.5} className="icon-with-text" />
            </div>
            <div className="currency-input">
                <InputFilter
                    value={EURFilter}
                    placeholder={"0"}
                    type="number"
                    min={0}
                    onChange={(event) => {
                        inputFilter("EUR", event.target.value);
                    }}
                />
                <Icon path={mdiCurrencyEur} size={1.5} className="icon-with-text" />
            </div>
            <button className="reset-button" onClick={resetInput}>
                {t("Reset")}
            </button>
        </div>,
    ];
}
export default Converter;
