import L from "leaflet";

L.Control.MapSearch = L.Control.extend({
    options: {
        quests: null,
        placeholderText: null,
        descriptionText: null,
        onlyActiveTasks: false,
    },
    onAdd: function (map) {
        const className = "leaflet-control-icon-search";
        const wrapper = (this._container = L.DomUtil.create("div", `search-wrapper ${className} maps-search-wrapper`));

        const collapsed = this.options.collapsed;

        L.DomEvent.disableClickPropagation(wrapper);
        L.DomEvent.disableScrollPropagation(wrapper);

        const form = (this._form = L.DomUtil.create("form", className + "-list"));
        wrapper.appendChild(form);

        if (collapsed) {
            this._map.on("click", this._collapse, this);

            if (!L.Browser.android) {
                L.DomEvent.on(
                    wrapper,
                    {
                        mouseenter: this._expand,
                        mouseleave: this._collapse,
                    },
                    this,
                );
            }
        }

        const link = (this._searchLink = L.DomUtil.create("a", className + "-toggle", wrapper));
        link.href = "#";
        link.title = this.options.searchTitle ?? "Search";

        if (L.Browser.touch) {
            L.DomEvent.on(link, "click", L.DomEvent.stop);
            L.DomEvent.on(link, "click", this._expand, this);
        } else {
            L.DomEvent.on(link, "focus", this._expand, this);
        }

        if (!collapsed) {
            this._expand();
        }

        const searchBar = L.DomUtil.create("input", "maps-search-wrapper-search-bar", form);
        searchBar.setAttribute("type", "text");
        searchBar.setAttribute("placeholder", this.options.placeholderText ?? "Task, item or container...");

        const info = L.DomUtil.create("div", "maps-search-wrapper-info", form);
        info.innerHTML = `<b>${this.options.descriptionText ?? "Supports multisearch (e.g. 'labs, ledx, bitcoin')"}</b>`;

        const resetSearch = L.DomUtil.create("button", "maps-search-wrapper-reset-search", form);
        resetSearch.innerHTML = "X";
        resetSearch.type = "button";

        const markers = {
            objectiveMarkers: [],
            nonObjectiveMarkers: [],
            itemAndContainerMarkers: [],
            allMarkers: [],
        };

        resetSearch.addEventListener("click", () => {
            searchBar.value = "";
            searchBar.dispatchEvent(new Event("input"));
        });

        // Prevent zooming of the map by double clicking the search field
        searchBar.addEventListener("dblclick", (e) => {
            e.stopPropagation();
        });

        searchBar.addEventListener(
            "input",
            debounce((e) => {
                const inputValue = e.target.value.trim();
                this._searchLink.dataset.badge = inputValue;

                // Split the input into multiple search terms and filter out empty strings
                const searchTerms = inputValue
                    .split(",")
                    .map((term) => term.trim().toLowerCase())
                    .filter((term) => term.length > 0);

                if (searchTerms.length === 0) {
                    // Reset markers if no valid search terms are provided
                    markers.allMarkers.forEach((marker) => {
                        if ("getElement" in marker && !("_bounds" in marker)) {
                            const element = marker.getElement();
                            if (!element) {
                                return;
                            }
                            element.classList.remove("not-shown");
                            element.classList.remove("pulse");
                        }
                    });
                    return;
                }

                // Reassign all markers to prevent layer toggles leading to bugs while toggling layers after a search
                markers.allMarkers = Object.values(map._targets);

                // #region Quest Searching
                const foundQuest = this.options.quests.filter((quest) =>
                    searchTerms.some((term) => quest.name.toLowerCase().includes(term)),
                );

                const { objectiveMarkers, nonObjectiveMarkers } = markers.allMarkers.reduce(
                    (acc, marker) => {
                        if (foundQuest.some((quest) => quest.id === marker.options.questId)) {
                            acc.objectiveMarkers.push(marker);
                        } else if (marker.options.markerType !== "playerPosition") {
                            acc.nonObjectiveMarkers.push(marker);
                        }

                        return acc;
                    },
                    { objectiveMarkers: [], nonObjectiveMarkers: [] },
                );

                markers.objectiveMarkers = objectiveMarkers;
                markers.nonObjectiveMarkers = nonObjectiveMarkers;

                markers.objectiveMarkers.forEach((marker) => {
                    if ("getElement" in marker) {
                        marker.getElement().classList.add("pulse");
                        marker.getElement().classList.remove("not-shown");
                    }
                });

                markers.nonObjectiveMarkers.forEach((marker) => {
                    if ("getElement" in marker) {
                        marker.getElement().classList.add("not-shown");
                        marker.getElement().classList.remove("pulse");
                    }
                });
                // #endregion

                // #region Item, Containers, and General Searching
                markers.itemAndContainerMarkers = [
                    ...markers.allMarkers.filter((marker) =>
                        searchTerms.some((term) => marker.options.title?.toLowerCase().includes(term)),
                    ),
                    ...markers.allMarkers.filter((marker) =>
                        searchTerms.some((term) =>
                            marker.options?.items?.some((item) => item.toLowerCase().includes(term)),
                        ),
                    ),
                ];

                markers.itemAndContainerMarkers.forEach((marker) => {
                    if ("getElement" in marker) {
                        marker.getElement().classList.add("pulse");
                        marker.getElement().classList.remove("not-shown");
                    }
                });
                // #endregion
            }, 300),
        );

        this._eventTarget = new EventTarget();
        this.hiddenTasks = new Set();
        if (this.options.hiddenTasks) {
            for (const taskId of this.options.hiddenTasks) {
                this.hiddenTasks.add(taskId);
            }
        }

        const taskFilterTitleDiv = L.DomUtil.create("div", "maps-search-wrapper-task-filter-title", form);
        const taskFilterTitle = L.DomUtil.create("span", "maps-search-wrapper-task-filter-title", taskFilterTitleDiv);
        taskFilterTitle.innerText = this.options.taskFilterTitle ?? "Task Filter";
        const buttonContainer = L.DomUtil.create(
            "span",
            "maps-search-task-filter-button-container",
            taskFilterTitleDiv,
        );
        const showAllButton = L.DomUtil.create("button", "maps-search-task-filter-show-all", buttonContainer);
        showAllButton.innerText = this.options.showAllButtonText ?? "All";
        showAllButton.type = "button";
        showAllButton.addEventListener("click", () => {
            const taskChecks = this.taskListDiv.getElementsByClassName("maps-search-task-selector");
            for (const taskCheck of taskChecks) {
                if (taskCheck.checked) {
                    continue;
                }
                taskCheck.checked = true;
            }
            for (const taskId of this.hiddenTasks.values()) {
                this.toggleTask(taskId, true);
            }
            this.hiddenTasks.clear();
            const event = new Event("hiddenTasksChanged");
            event.tasks = [...this.hiddenTasks];
            this._eventTarget.dispatchEvent(event);
        });
        const hideAllButton = L.DomUtil.create("button", "maps-search-task-filter-hide-all", buttonContainer);
        hideAllButton.innerText = this.options.hideAllButtonText ?? "None";
        hideAllButton.type = "button";
        hideAllButton.addEventListener("click", () => {
            const taskChecks = this.taskListDiv.getElementsByClassName("maps-search-task-selector");
            for (const taskCheck of taskChecks) {
                if (!taskCheck.checked) {
                    continue;
                }
                taskCheck.checked = false;
                this.toggleTask(taskCheck.dataset.taskId, false);
                this.hiddenTasks.add(taskCheck.dataset.taskId);
            }
            const event = new Event("hiddenTasksChanged");
            event.tasks = [...this.hiddenTasks];
            this._eventTarget.dispatchEvent(event);
        });

        const taskFilter = L.DomUtil.create("input", "maps-search-task-filter", form);
        taskFilter.setAttribute("type", "text");
        taskFilter.setAttribute("placeholder", this.options.taskFilterPlaceholderText ?? "Task name");

        //const info = L.DomUtil.create("div", "maps-search-wrapper-info", form);
        //info.innerHTML = `<b>${this.options.descriptionText ?? "Supports multisearch (e.g. 'labs, ledx, bitcoin')"}</b>`;

        const resetTaskFilter = L.DomUtil.create("button", "maps-search-wrapper-reset-task-filter", form);
        resetTaskFilter.innerHTML = "X";
        resetTaskFilter.type = "button";

        resetTaskFilter.addEventListener("click", () => {
            taskFilter.value = "";
            taskFilter.dispatchEvent(new Event("input"));
        });

        this.taskListDiv = L.DomUtil.create("div", "maps-search-task-list", form);

        // Prevent zooming of the map by double clicking the task filter field
        taskFilter.addEventListener("dblclick", (e) => {
            e.stopPropagation();
        });

        taskFilter.addEventListener("input", (e) => {
            const inputValue = e.target.value.trim().toLowerCase();

            const taskNameElements = this.taskListDiv.getElementsByClassName("maps-search-task-name-label");
            for (const taskNameElement of taskNameElements) {
                const showTask = !inputValue || taskNameElement.innerText.toLowerCase().includes(inputValue);
                if (showTask) {
                    taskNameElement.parentElement?.classList.remove("hide-task");
                } else {
                    taskNameElement.parentElement?.classList.add("hide-task");
                }
            }
        });

        return wrapper;
    },

    _expand: function () {
        L.DomUtil.addClass(this._container, "leaflet-control-icon-search-expanded");
        this._form.style.height = null;
        var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
        //acceptableHeight = Math.max(acceptableHeight, 225);
        if (acceptableHeight < this._form.clientHeight || this._form.clientHeight === 0) {
            L.DomUtil.addClass(this._form, "leaflet-control-icon-search-scrollbar");
            this._form.style.height = acceptableHeight + "px";
        } else {
            L.DomUtil.removeClass(this._form, "leaflet-control-icon-search-scrollbar");
        }

        return this;
    },

    _expandIfNotCollapsed: function () {
        if (this._map && !this.options.collapsed) {
            this._expand();
        }
        return this;
    },

    _collapse: function () {
        this._container.className = this._container.className.replace(" leaflet-control-icon-search-expanded", "");
    },

    addCollapseListeners: function () {
        this._map.on("click", this._collapse, this);

        if (!L.Browser.android) {
            L.DomEvent.on(
                this._container,
                {
                    mouseenter: this._expand,
                    mouseleave: this._collapse,
                },
                this,
            );
        }
    },

    removeCollapseListeners: function () {
        this._map.off("click", this._collapse, this);

        if (!L.Browser.android) {
            L.DomEvent.off(
                this._container,
                {
                    mouseenter: this._expand,
                    mouseleave: this._collapse,
                },
                this,
            );
        }
    },

    setCollapse: function (collapsed) {
        this.options.collapsed = collapsed;
        if (collapsed) {
            this.addCollapseListeners();
            this._collapse();
        } else {
            this.removeCollapseListeners();
            this._expand();
        }
    },

    setOnlyActiveTasks: function (onlyActive) {
        this.options.onlyActiveTasks = onlyActive;
        this.setTasks(this.options.tasks);
    },

    setTasks: function (tasks) {
        this.options.tasks = tasks;
        this.taskListDiv.replaceChildren();
        for (const task of tasks) {
            if (this.options.onlyActiveTasks && !task.active) {
                continue;
            }
            const taskLabel = L.DomUtil.create("label", "maps-search-wrapper-task-label", this.taskListDiv);
            const taskCheck = L.DomUtil.create("input", "maps-search-task-selector", taskLabel);
            taskCheck.type = "checkbox";
            taskCheck.dataset.taskId = task.id;
            if (!this.hiddenTasks.has(task.id)) {
                taskCheck.checked = true;
            }
            const taskName = L.DomUtil.create("span", "maps-search-task-name-label", taskLabel);
            taskName.innerText = task.name;

            taskCheck.addEventListener("change", (e) => {
                const showTask = e.target.checked;
                const taskId = e.target.dataset.taskId;
                if (showTask) {
                    this.hiddenTasks.delete(taskId);
                } else {
                    this.hiddenTasks.add(taskId);
                }
                this.toggleTask(taskId, showTask);
                const event = new Event("hiddenTasksChanged");
                event.tasks = [...this.hiddenTasks];
                this._eventTarget.dispatchEvent(event);
            });
        }
    },

    toggleTask: function (taskId, showTask) {
        for (const marker of Object.values(this._map._targets)) {
            if (!marker.options.questId) {
                continue;
            }
            if (marker.options.questId !== taskId) {
                continue;
            }
            if (!marker.getElement) {
                continue;
            }
            const element = marker.getElement();
            if (!element) {
                continue;
            }
            if (showTask) {
                element.classList.remove("hidden-task");
            } else {
                element.classList.add("hidden-task");
            }
        }
    },

    on: function (eventType, listener, options) {
        this._eventTarget.addEventListener(eventType, listener, options);
    },

    once: function (eventType, listener, options) {
        this._eventTarget.addEventListener(eventType, listener, {
            ...options,
            once: true,
        });
    },

    off: function (eventType, listener, options) {
        this._eventTarget.removeEventListener(eventType, listener, options);
    },
});

L.control.mapSearch = function (opts) {
    return new L.Control.MapSearch(opts);
};

// #region Helper functions
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
// #endregion
