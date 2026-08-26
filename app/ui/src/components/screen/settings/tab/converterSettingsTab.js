import React, {Component} from "react";
import {SettingsInput} from "./world_settings/settingsInput";
import {saveAs} from "file-saver";
import JSZip from "jszip";
import {t} from "../../../../i18n";

export class ConverterSettingsTab extends Component {
    app = this.props.app;

    updateSetting = (name, value) => {
        let newSettings = Object.assign({}, this.app.state.converterSettings);

        // If it's the default value delete it
        if (value === this.app.defaultConverterSettings[name]) {
            delete newSettings[name];
        } else {
            newSettings[name] = value;
        }

        this.app.setState({converterSettings: newSettings});
    };

    getOptions = () => {
        let normal = [
            {
                "display": t("converter.customIdentifiers.display"),
                "name": "customIdentifiers",
                "description": t("converter.customIdentifiers.description"),
                "type": "Boolean"
            },
            {
                "display": t("converter.blockConnections.display"),
                "name": "blockConnections",
                "description": t("converter.blockConnections.description"),
                "type": "Boolean"
            },
            {
                "display": t("converter.itemConversion.display"),
                "name": "itemConversion",
                "description": t("converter.itemConversion.description"),
                "type": "Boolean"
            },
            {
                "display": t("converter.lootTableConversion.display"),
                "name": "lootTableConversion",
                "description": t("converter.lootTableConversion.description"),
                "type": "Boolean"
            },
            {
                "display": t("converter.mapConversion.display"),
                "name": "mapConversion",
                "description": t("converter.mapConversion.description"),
                "type": "Boolean"
            },
            {
                "display": t("converter.discardEmptyChunks.display"),
                "name": "discardEmptyChunks",
                "description": t("converter.discardEmptyChunks.description"),
                "type": "Boolean"
            },
            {
                "display": t("converter.preventYBiomeBlending.display"),
                "name": "preventYBiomeBlending",
                "description": t("converter.preventYBiomeBlending.description"),
                "type": "Boolean"
            }
        ];

        // If bedrock output add bedrock states
        if (this.app.state.outputType.id.startsWith("BEDROCK")) {
            normal = normal.concat({
                "display": t("converter.enableCompact.display"),
                "name": "enableCompact",
                "description": t("converter.enableCompact.description"),
                "type": "Boolean"
            });
        }

        // Generate values (Falling back to defaults when not present)
        let app = this.app;
        normal.forEach(obj => {
            let value = app.state.converterSettings[obj.name];
            obj.value = value !== undefined ? value : app.defaultConverterSettings[obj.name];
        });
        return normal;
    };

    downloadEmbedded = () => {
        // Generate a ZIP
        let zip = new JSZip();
        zip.file("world_settings.chunker.json", JSON.stringify(this.app.state.editedSettings));
        zip.file("converter_settings.chunker.json", JSON.stringify(this.app.state.converterSettings));
        zip.file("block_mappings.chunker.json", this.app.getBlockMappingsJSON());
        zip.file("pruning.chunker.json", this.app.getPruningJSON());
        zip.file("dimension_mappings.chunker.json", this.app.getDimensionMappingsJSON());
        zip.file("biome_mappings.chunker.json", this.app.getBiomeMappingsJSON());
        zip.file("custom_dimensions.chunker.json", this.app.getCustomDimensionsJSON());
        zip.file("README.txt", t("converter.readmeTxt"));

        zip.generateAsync({type: "blob"}).then(function (blob) {
            saveAs(blob, "ExportedChunkerSettings.zip");
        }, function (err) {
            // Just print for now
            console.error(err);
        });
    };

    render() {
        let settings = this.getOptions();
        return (
            <div>
                <React.Fragment>
                    <div className="topbar">
                        <h1>{t("settings.tab.converter")}</h1>
                        <h2>{t("converter.subtitle")}</h2>
                    </div>
                    <div className="main_content settings dimensions">
                        {settings.map(setting => (
                            <SettingsInput key={setting.name} base={setting} name={setting.display}
                                           onChange={(name, value) => this.updateSetting(name, value)}/>
                        ))}
                        <div className="white_box">
                            <label className="legend" htmlFor="name">
                                <span className="tooltip">{t("converter.exportPreloadTooltip")}</span>{t("converter.exportPreloadLabel")}
                            </label>
                            <div className="fields">
                                <button
                                    className="button blue small"
                                    onClick={(e) => this.downloadEmbedded()}>{t("converter.saveZip")}
                                </button>
                            </div>
                        </div>
                        <div className="white_box">
                            <label className="legend" htmlFor="name">
                                <span className="tooltip">{t("converter.exportCliTooltip")}</span>{t("converter.exportCliLabel")}
                            </label>
                            <div className="fields">
                                <button
                                    className="button magenta small"
                                    onClick={(e) => this.app.screen.current.switchTab("cli", e)}>{t("converter.exportButton")}
                                </button>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </div>
        );
    }
}