/* eslint-disable react/prop-types */
import { useCallback, useEffect } from "react";
import { useState } from "react";
import "./styles.css";
import debounce from "lodash/debounce";
import SuggestionsList from "./SuggestionsList";
// import useCache from "../hooks/use-cache";

const Autocomplete = ({
    staticData,
    fetchSuggestions,
    placeholder = "",
    customloading = "Loading...",
    // caching = true,
    onSelect = () => { },
    onBlur = () => { },
    onFocus = () => { },
    onChange = () => { },
    customStyles = {},
    dataKey = "",
}) => {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // const {setCache, getCache} = useCache("autocomplete", 3600);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
        onChange(event.target.value);
    };

    const getSuggestions = async (query) => {
        setError(null);

        setLoading(true);
        console.log("fetching suggestions for", query);
        try {
            let result;
            if (staticData) {
                result = staticData.filter((item) => {
                    return item.toLowerCase().includes(query.toLowerCase());
                });
            } else if (fetchSuggestions) {
                result = await fetchSuggestions(query);
            }
            // setCache(query, result);
            setSuggestions(result);
        } catch (err) {
            setError("Failed to fetch suggestions");
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const debounce = setTimeout(() => {

            if (inputValue.length > 1) {
                getSuggestions(inputValue);
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(debounce);
    }, [inputValue]);

    const handleSuggestionClick = (suggestion) => {
        setInputValue(dataKey ? suggestion[dataKey] : dataKey);
        onSelect(suggestion);
        setSuggestions([]);
    };

    return (
        <div className="container">
            <input
                type="text"
                value={inputValue}
                placeholder={placeholder}
                style={customStyles}
                onBlur={onBlur}
                onFocus={onFocus}
                onChange={handleInputChange}
            />

            {(suggestions.length > 0 || loading || error) && (
                <ul className="suggestions-list" role="listbox">
                    {error && <div className="error">{error}</div>}
                    {loading && <div className="loading">{customloading}</div>}
                    <SuggestionsList
                        dataKey={dataKey}
                        highlight={inputValue}
                        suggestions={suggestions}
                        onSuggestionClick={handleSuggestionClick}
                    />
                </ul>
            )}
        </div>
    );
};

export default Autocomplete;