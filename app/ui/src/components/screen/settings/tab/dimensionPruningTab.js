import React, {Component} from "react";
import {ProgressComponent} from "../../../progress";
import {SettingsInput} from "./world_settings/settingsInput";
import {t} from "../../../../i18n";

export function getDimensionDisplayName(identifier) {
    switch (identifier) {
        case "minecraft:overworld":
            return t("dimension.overworld");
        case "minecraft:the_nether":
            return t("dimension.nether");
        case "minecraft:the_end":
            return t("dimension.end");
        default:
            return identifier;
    }
}

export const VANILLA_DIMENSIONS = ["minecraft:overworld", "minecraft:the_nether", "minecraft:the_end"];

export function isVanillaDimension(identifier) {
    return VANILLA_DIMENSIONS.includes(identifier);
}

// Identifier pattern which excludes vanilla dimensions
const IDENTIFIER_PATTERN = "(?!(?:" + VANILLA_DIMENSIONS.join("|") + ")$)[\\w\\-]+:[\\w\\-]+";
const VALID_IDENTIFIER = new RegExp("^(?:" + IDENTIFIER_PATTERN + ")$");

export function isValidDimensionIdentifier(identifier) {
    return VALID_IDENTIFIER.test(identifier);
}

const DIMENSION_DEFAULTS = {identifier: "", biomeHeight: 24, fallbackBiome: "minecraft:plains"};
const DEFAULT_IDENTIFIER_PREFIX = "my:world_";

function getCustomDimensionFields() {
    return [
        {
            "display": t("custom.identifier.display"), "name": "identifier", "type": "String", "identifierOnly": true,
            "description": t("custom.identifier.description"),
            "pattern": IDENTIFIER_PATTERN,
            "coerce": (value) => value.trim().toLowerCase()
        },
        {
            "display": t("custom.biomeHeight.display"), "name": "biomeHeight", "type": "Int32", "min": 1, "max": 256,
            "description": t("custom.biomeHeight.description"),
            "coerce": (value) => parseInt(value)
        },
        {
            "display": t("custom.fallbackBiome.display"), "name": "fallbackBiome", "type": "Biome",
            "description": t("custom.fallbackBiome.description"),
            "placeholder": t("custom.fallbackBiome.placeholder"),
            "allowCustom": false,
            "coerce": (value) => value || DIMENSION_DEFAULTS.fallbackBiome
        }
    ];
}

function getDimensionColor(identifier) {
    switch (identifier) {
        case "minecraft:overworld":
            return "green";
        case "minecraft:the_nether":
            return "red";
        case "minecraft:the_end":
            return "yellow";
        default:
            return "magenta";
    }
}

export class DimensionPruningTab extends Component {
    app = this.props.app;

    validateSetting = (tab, setting) => {
        if (setting.type !== "Int32") return; // Don't validate any other settings

        // Ensure we don't have NaN set as a value
        if (this.app.state.pruningSettings[tab]) {
            if (isNaN(this.app.state.pruningSettings[tab].regions[setting.region][setting.name])) {
                // Reset NaN -> 0
                this.app.setState((prevState) => {
                    let pruningSettingsClone = JSON.parse(JSON.stringify(prevState.pruningSettings));
                    pruningSettingsClone[tab].regions[setting.region][setting.name] = 0;

                    return {pruningSettings: pruningSettingsClone};
                }, () => this.validateSetting(tab, setting)); // Validate when done to ensure no reordering is needed
            } else {
                // Ensure that min & max is the right way around
                let minName = setting.name.replace("max", "min");
                let maxName = setting.name.replace("min", "max");

                // Get current values
                let min = this.app.state.pruningSettings[tab].regions[setting.region][minName];
                let max = this.app.state.pruningSettings[tab].regions[setting.region][maxName];

                // If min > max, then we should swap them
                if (min !== max && min > max) {
                    this.app.setState((prevState) => {
                        let pruningSettingsClone = JSON.parse(JSON.stringify(prevState.pruningSettings));

                        // Set the new min
                        pruningSettingsClone[tab].regions[setting.region][minName] = max;

                        // Set the new max
                        pruningSettingsClone[tab].regions[setting.region][maxName] = min;

                        return {pruningSettings: pruningSettingsClone};
                    });
                }
            }
        }
    }

    updateSetting = (tab, name, value, setting) => {
        if (name === "Dimension") {
            this.app.setState((prevState) => {
                let dimensionMappingClone = Object.assign({}, prevState.dimensionMapping);

                if (value === "NONE") {
                    delete dimensionMappingClone[tab];
                } else {
                    dimensionMappingClone[tab] = value;
                }

                return {dimensionMapping: dimensionMappingClone};
            });
        } else if (name === "Pruning") {
            this.app.setState((prevState) => {
                let pruningSettingsClone = JSON.parse(JSON.stringify(prevState.pruningSettings));

                if (value !== "OFF") {
                    pruningSettingsClone[tab] = {
                        regions: [{
                            minChunkX: -10,
                            minChunkZ: -10,
                            maxChunkX: 10,
                            maxChunkZ: 10
                        }],
                        ...pruningSettingsClone[tab],
                        include: value === "INCLUDE"
                    };
                } else {
                    pruningSettingsClone[tab] = null;
                }

                return {pruningSettings: pruningSettingsClone};
            });
        } else if (name === "addRegion") {
            this.app.setState((prevState) => {
                let pruningSettingsClone = JSON.parse(JSON.stringify(prevState.pruningSettings));
                pruningSettingsClone[tab].regions = pruningSettingsClone[tab].regions.concat([{
                    minChunkX: -10,
                    minChunkZ: -10,
                    maxChunkX: 10,
                    maxChunkZ: 10
                }]);

                return {pruningSettings: pruningSettingsClone};
            });
        } else if (name === "removeRegion") {
            this.app.setState((prevState) => {
                let pruningSettingsClone = JSON.parse(JSON.stringify(prevState.pruningSettings));
                pruningSettingsClone[tab].regions.splice(setting.region, 1);

                return {pruningSettings: pruningSettingsClone};
            });
        } else {
            this.app.setState((prevState) => {
                let pruningSettingsClone = JSON.parse(JSON.stringify(prevState.pruningSettings));

                // Update settings
                if (name === "name") {
                    // Check if name is equal to the default
                    if (value !== t("region.defaultName", {index: setting.region + 1})) {
                        pruningSettingsClone[tab].regions[setting.region][name] = value;
                    } else {
                        // Delete the name
                        delete pruningSettingsClone[tab].regions[setting.region][name];
                    }
                } else {
                    // Parse as int
                    pruningSettingsClone[tab].regions[setting.region][name] = parseInt(value);
                }


                // Return the new state
                return {pruningSettings: pruningSettingsClone};
            });
        }
    };

    setTab = (name, e) => {
        e.preventDefault();
        this.app.setState({dimensionSettingsTab: name});
    };

    isPreExistingDimension = (identifier) => !isVanillaDimension(identifier)
        && (this.app.state.settings?.dimensions ?? []).includes(identifier);

    addCustomDimension = (e) => {
        e.preventDefault();
        this.app.setState((prevState) => {
            let dimensions = prevState.customDimensions?.dimensions ?? [];

            // Find a default name to use
            let taken = new Set((this.app.state.settings?.dimensions ?? [])
                .concat(dimensions.map(dimension => dimension.identifier)));
            let suffix = 1;
            while (taken.has(DEFAULT_IDENTIFIER_PREFIX + suffix)) suffix++;

            // Return the new entry
            return {
                customDimensions: {
                    dimensions: dimensions.concat([Object.assign({}, DIMENSION_DEFAULTS, {
                        identifier: DEFAULT_IDENTIFIER_PREFIX + suffix
                    })])
                },
                dimensionSettingsTab: "#" + dimensions.length
            };
        });
    };

    deleteCustomDimension = (index) => {
        this.app.setState((prevState) => {
            let dimensions = prevState.customDimensions?.dimensions ?? [];

            return {
                customDimensions: {dimensions: dimensions.filter((dim, i) => i !== index)},
                dimensionSettingsTab: undefined
            };
        });
    };

    updateCustomDimension = (index, target, field, value) => {
        this.app.setState((prevState) => {
            // Create the entry
            let dimensions = (prevState.customDimensions?.dimensions ?? []).slice();
            let previous = dimensions[index] ?? target;
            let entry = Object.assign({}, previous, {[field.name]: field.coerce ? field.coerce(value) : value});

            // -1 indicates a new entry
            dimensions[index === -1 ? dimensions.length : index] = entry;

            let state = {customDimensions: {dimensions: dimensions}};

            // Ensure we rename previous identifiers
            if (previous.identifier && previous.identifier !== entry.identifier) {
                state.dimensionMapping = Object.fromEntries(Object.entries(prevState.dimensionMapping)
                    .map(([input, output]) => [input, output === previous.identifier ? entry.identifier : output]));
            }
            return state;
        });
    };

    validateCustomDimension = (index, entry, field) => {
        if (index === -1 || field.type !== "Int32") return; // No need to validate non numbers

        // Ensure the field is within max and min
        this.updateCustomDimension(index, entry, field, Math.min(field.max, Math.max(field.min, entry[field.name] || field.min)));
    };

    toCustomDimensionOptions = (entry) => {
        return getCustomDimensionFields().filter(field => !field.identifierOnly || !this.isPreExistingDimension(entry.identifier))
            .map(field => Object.assign({}, field, {
                "value": entry[field.name],
                "suggestions": field.type === "Biome" ? this.app.state.outputBiomeSuggestions : undefined
            }));
    }

    toDimensionOption = (input) => {
        let identifiers = [...this.app.getKnownDimensions()];
        return {
            "name": "Dimension",
            "description": t("dimensions.changeDescription", {source: getDimensionDisplayName(input)}),
            "type": "Radio",
            "value": this.app.getDimensionMappings()[input] ?? "NONE",
            "options": [
                {
                    "name": t("dimension.optionNone"),
                    "color": "blue",
                    "value": "NONE"
                },
                ...identifiers.map(dim => ({
                    "name": getDimensionDisplayName(dim), "color": getDimensionColor(dim),
                    "raw": !isVanillaDimension(dim), "value": dim
                }))
            ]
        };
    };

    getOptions = (dimension) => {
        let enabled = !!(this.app.state.pruningSettings[dimension]
            && this.app.state.pruningSettings[dimension].regions
            && this.app.state.pruningSettings[dimension].regions.length > 0);
        let pruningSetting = enabled ? (this.app.state.pruningSettings[dimension].include ? "INCLUDE" : "EXCLUDE") : "OFF";
        let options = [
            {
                "name": "Pruning",
                "display": t("pruning.displayName"),
                "description": t("pruning.description"),
                "type": "Radio",
                "value": pruningSetting,
                "options": [
                    {
                        "name": t("pruning.off"),
                        "color": "blue",
                        "value": "OFF"
                    },
                    {
                        "name": t("pruning.include"),
                        "color": "green",
                        "value": "INCLUDE"
                    },
                    {
                        "name": t("pruning.exclude"),
                        "color": "red",
                        "value": "EXCLUDE"
                    }
                ]
            }
        ];

        if (this.app.state.pruningSettings[dimension] && this.app.state.pruningSettings[dimension].regions) {
            this.app.state.pruningSettings[dimension].regions.forEach((region, index) => {
                options = options.concat([{
                    "display": t("region.defaultName", {index: index + 1}),
                    "name": "removeRegion",
                    "description": t("region.removeDescription"),
                    "header": true,
                    "type": "Button",
                    "value": "X",
                    "region": index
                }]);
                // Add settings for dimension pruning
                options = options.concat([
                    {
                        "display": t("region.name.display"),
                        "name": "name",
                        "description": t("region.name.description"),
                        "type": "String",
                        "value": region.name ?? t("region.defaultName", {index: index + 1}),
                        "region": index
                    },
                    {
                        "display": t("region.minChunkX.display"),
                        "name": "minChunkX",
                        "description": t("region.minChunkX.description"),
                        "type": "Int32",
                        "value": region.minChunkX,
                        "region": index
                    },
                    {
                        "display": t("region.minChunkZ.display"),
                        "name": "minChunkZ",
                        "description": t("region.minChunkZ.description"),
                        "type": "Int32",
                        "value": region.minChunkZ,
                        "region": index
                    },
                    {
                        "display": t("region.maxChunkX.display"),
                        "name": "maxChunkX",
                        "description": t("region.maxChunkX.description"),
                        "type": "Int32",
                        "value": region.maxChunkX,
                        "region": index
                    },
                    {
                        "display": t("region.maxChunkZ.display"),
                        "name": "maxChunkZ",
                        "description": t("region.maxChunkZ.description"),
                        "type": "Int32",
                        "value": region.maxChunkZ,
                        "region": index
                    }
                ]);
            });

            // Only show add region if it's enabled
            if (enabled) {
                options = options.concat([
                    {
                        "display": t("region.addRegion"),
                        "borderless": true,
                        "name": "addRegion",
                        "description": t("region.addRegionDescription"),
                        "value": t("region.addRegion"),
                        "type": "Button"
                    }
                ]);
            }
        }
        return options;
    };

    render() {
        let customDimensions = this.app.state.customDimensions?.dimensions ?? [];
        let tab = this.app.state.dimensionSettingsTab;

        // The tab is either an index of the custom dimension or the identifier in the world
        let isCustomTab = tab != null && tab.startsWith("#");

        // Check whether the dimension exists
        if (isCustomTab) {
            let declared = customDimensions[parseInt(tab.substring(1))];
            if (declared != null && this.isPreExistingDimension(declared.identifier)) {
                tab = declared.identifier;
                isCustomTab = false;
            }
        }

        if (tab === undefined && this.app.settingsProgress.isComplete()) {
            tab = this.app.state.settings.dimensions[0];
        }

        let customIndex = isCustomTab ? parseInt(tab.substring(1)) : customDimensions.findIndex(dim => dim.identifier === tab);

        let customEntry;
        if (isCustomTab) {
            customEntry = customDimensions[customIndex];
        } else if (tab != null && !isVanillaDimension(tab)) {
            customEntry = customDimensions[customIndex] ?? Object.assign({}, DIMENSION_DEFAULTS, {identifier: tab});
        }

        // Dimensions which are new can't have pruning settings (since there is no existing data)
        let mappingKey = isCustomTab ? null : tab;
        let pruningSettings = mappingKey ? this.getOptions(mappingKey) : [];

        let tabs = (this.app.state.settings?.dimensions ?? []).map(identifier => ({
            id: identifier, label: getDimensionDisplayName(identifier), raw: !isVanillaDimension(identifier)
        })).concat(customDimensions.flatMap((dim, index) => this.isPreExistingDimension(dim.identifier) ? [] : [{
            id: "#" + index, label: dim.identifier || t("dimension.customTab", {index: index + 1}), raw: !!dim.identifier
        }]));
        return (
            <div>
                {(this.app.settingsProgress.isComplete() &&
                    <React.Fragment>
                        <div className="topbar">
                            <h1>{t("dimensions.title")}</h1>
                            <h2>{t("dimensions.subtitle")}</h2>
                            {(customDimensions.length > 0 || tabs.some(({raw}) => raw)) &&
                                <h2><strong>{t("dimensions.notePrefix")}</strong>{t("dimensions.noteRest")}</h2>}
                            <ul className="tabs dimension_tabs">
                                {tabs.map(({id, label, raw}) => (
                                    <li key={id}>
                                        <button
                                            className={[tab === id && "active", raw && "identifier"].filter(Boolean).join(" ")}
                                            title={raw ? label : undefined}
                                            onClick={(e) => this.setTab(id, e)}>{label}</button>
                                    </li>
                                ))}
                                <li>
                                    <button title={t("dimensions.addCustomTooltip")}
                                            onClick={this.addCustomDimension}>+
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div className="main_content settings dimensions" id={tab}>
                            {customEntry != null && this.toCustomDimensionOptions(customEntry).map(setting => (
                                <SettingsInput key={setting.name} base={setting} name={setting.display}
                                               onChange={(name, value) => this.updateCustomDimension(customIndex, customEntry, setting, value)}
                                               onBlur={() => this.validateCustomDimension(customIndex, customEntry, setting)}/>
                            ))}
                            {mappingKey &&
                                <SettingsInput base={this.toDimensionOption(mappingKey)}
                                               name={t("dimensions.outputDimension")}
                                               onChange={(name, value) => this.updateSetting(mappingKey, name, value)}/>}
                            {pruningSettings.map(setting => (
                                <SettingsInput key={setting.name + ":" + setting.region} base={setting}
                                               name={setting.display}
                                               onChange={(name, value) => this.updateSetting(mappingKey, name, value, setting)}
                                               onBlur={() => this.validateSetting(mappingKey, setting)}/>
                            ))}
                            {customEntry != null && !this.isPreExistingDimension(customEntry.identifier) &&
                                <SettingsInput base={{
                                    "display": t("region.deleteCustomDimension"),
                                    "borderless": true,
                                    "name": "delete",
                                    "description": t("region.deleteCustomDimensionDescription"),
                                    "value": t("region.deleteCustomDimensionValue"),
                                    "type": "Button"
                                }} name={t("region.deleteCustomDimension")}
                                               onChange={() => this.deleteCustomDimension(customIndex)}/>}
                        </div>
                    </React.Fragment>
                )}
                {(!this.app.settingsProgress.isComplete() &&
                    <div className="center-table">
                        <div className="center-cell">
                            <div>
                                <ProgressComponent progress={this.app.settingsProgress}/>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
