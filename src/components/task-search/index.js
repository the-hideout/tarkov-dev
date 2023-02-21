import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useHotkeys } from 'react-hotkeys-hook';
import debounce from 'lodash.debounce';

import useKeyPress from '../../hooks/useKeyPress';

import './index.css';
import { useQuestsQuery } from '../../features/quests/queries';

function TaskSearch({
    defaultValue,
    onChange,
    placeholder,
    autoFocus,
    showDropdown,
}) {
    const { data: tasks } = useQuestsQuery();
    const { t } = useTranslation();

    const [nameFilter, setNameFilter] = useState(defaultValue || '');
    const [cursor, setCursor] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const downPress = useKeyPress('ArrowDown');
    const upPress = useKeyPress('ArrowUp');
    const enterPress = useKeyPress('Enter');
    let navigate = useNavigate();
    let location = useLocation();
    const inputRef = useRef(null);

    if (!placeholder) {
        placeholder = t('Search task...');
    }

    useHotkeys('ctrl+q', () => {
        if (inputRef?.current.scrollIntoView) {
            inputRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }

        inputRef?.current.focus();
    });

    const debouncedOnChange = useRef(
        debounce((newValue) => {
            onChange(newValue);
        }, 300),
    ).current;

    const handleNameFilterChange = useCallback(
        (e) => {
            setNameFilter(e.target.value.toLowerCase());
            if (onChange) {
                debouncedOnChange(e.target.value.toLowerCase());
            }
        },
        [setNameFilter, debouncedOnChange, onChange],
    );

    useEffect(() => {
        if (downPress) {
            setCursor((prevState) => Math.min(prevState + 1, 9));
        }
    }, [downPress]);

    useEffect(() => {
        if (upPress) {
            setCursor((prevState) =>
                prevState > 0 ? prevState - 1 : prevState,
            );
        }
    }, [upPress]);

    if (autoFocus && window?.matchMedia && window.matchMedia('(max-width: 600px)').matches) {
        autoFocus = false;
    }

    const data = useMemo(() => {
        if (!nameFilter || !showDropdown) {
            return [];
        }

        let returnData = tasks
            .map((taskData) => {
                return {
                    id: taskData.id,
                    name: taskData.name,
                    normalizedName: taskData.normalizedName,
                };
            })
            .filter((task) => {
                if (nameFilter.length <= 0) {
                    return false;
                }
                return task.name.toLowerCase().includes(nameFilter.toLowerCase());
            });

        return returnData;
    }, [nameFilter, showDropdown, tasks]);

    useEffect(() => {
        if (enterPress && data[cursor]) {
            navigate(`/task/${data[cursor].normalizedName}`);
            setCursor(0);
            setNameFilter('');
        }
    }, [cursor, enterPress, data, navigate]);

    useEffect(() => {
        setCursor(0);
        setNameFilter('');
    }, [location]);

    return (
        <div className="item-search">
            <input
                type="text"
                // defaultValue = {defaultValue || nameFilter}
                onChange={handleNameFilterChange}
                placeholder={placeholder}
                value={nameFilter}
                autoFocus={autoFocus}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                ref={inputRef}
            />
            {!isFocused && <div className="search-tip-wrapper">ctrl+q</div>}
            {showDropdown && (
                <div className="item-list-wrapper">
                    {data.map((task, index) => {
                        if (index >= 10) {
                            return null;
                        }

                        return (
                            <Link
                                className={`search-result-wrapper ${
                                    index === cursor ? 'active' : ''
                                }`}
                                key={`search-result-wrapper-${task.id}`}
                                to={`/task/${task.normalizedName}`}
                            >
                                {task.name}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default TaskSearch;
