import React from "react";
import {BaseScreen} from "../baseScreen";
import {SaveScreen} from "../save/saveScreen";
import api from "../../../api";
import {ProgressComponent, ProgressTracker} from "../../progress";
import {getVersionName} from "../mode/modeOption";
import {t, tt} from "../../../i18n";

export class ProcessingScreen extends BaseScreen {
    mounted = true;
    progress = new ProgressTracker("Converting world", (newState) => this.setState({progress: newState}), this.app.cancelTask);
    state = {
        progress: this.progress.state
    };

    constructor(props) {
        super(props);

        // Generate
        this.convert();
    }

    getStage = () => {
        return 3;
    };

    componentWillUnmount = () => this.mounted = false;

    componentDidMount = () => {
        this.mounted = true;
        super.componentDidMount();
    };

    nextScreen = () => this.app.setScreen(SaveScreen);

    convert = () => {
        // Setup conversion
        let self = this;

        // Cancel any existing tasks, they aren't needed and this ensures all locks are free for the input world
        this.app.cancelTask(function() {
            // Set world settings (after it chains the next part)
            api.send({
                type: "settings",
                method: "set_world_settings",
                settings: self.app.state.editedSettings
            }, function (message) {
                if (message.type === "error") {
                    console.info("Failed to set settings: " + message.error);
                    self.app.showError(t("error.setWorldSettings.title"), message.error, message.errorId, message.stackTrace, false);
                } else {
                    self.convertSetName();
                }
            });
        });
    };

    convertSetName = () => {
        let self = this;

        // Set meta
        api.send({
            type: "settings",
            method: "set_output_name",
            name: self.app.getWorldName().replace(/\s/g, "_") + "_" + new Date().toISOString().slice(0, 10).replace(/[/]/g, "-") + "@" + new Date().toLocaleTimeString().replace(/:/g, "-")
        }, function (message) {
            if (message.type === "error") {
                console.info("Failed to set settings: " + message.error);
                self.app.showError(t("error.setWorldSettings.title"), message.error, message.errorId, message.stackTrace, false);
            } else {
                self.convertSetDimensionRegistry();
            }
        });
    };

    convertSetDimensionRegistry = () => {
        let self = this;

        // Set dimension registry
        api.send({
            type: "settings",
            method: "set_dimension_registry",
            dimensions: self.app.getCustomDimensions()
        }, function (message) {
            if (message.type === "error") {
                console.info("Failed to set custom dimensions: " + message.error);
                self.app.showError(t("error.setCustomDimensions.title"), message.error, message.errorId, message.stackTrace, false);
            } else {
                self.convertSetDimensionMappings();
            }
        });
    };

    convertSetDimensionMappings = () => {
        let self = this;

        // Set dimension mappings
        api.send({
            type: "mappings",
            method: "set_dimension_mappings",
            dimensions: self.app.getDimensionMappings()
        }, function (message) {
            if (message.type === "error") {
                console.info("Failed to set dimension mappings: " + message.error);
                self.app.showError(t("error.setDimensionMappings.title"), message.error, message.errorId, message.stackTrace, false);
            } else {
                self.convertSetPruning();
            }
        });
    };

    convertSetPruning = () => {
        let self = this;

        let pruningSettings = this.app.state.pruningSettings;

        // Set dimensions
        api.send({
            type: "settings",
            method: "set_pruning_settings",
            settings: {
                configs: pruningSettings
            }
        }, function (message) {
            if (message.type === "error") {
                console.info("Failed to set pruning: " + message.error);
                self.app.showError(t("error.setPruning.title"), message.error, message.errorId, message.stackTrace, false);
            } else {
                self.convertSetMappings();
            }
        });
    };

    convertSetMappings = () => {
        let self = this;

        // Remove invalid mappings
        let clone = JSON.parse(JSON.stringify(this.app.state.mappings));
        // This checks we don't have empty identifiers, they should be null/undefined if valid (custom blocks)
        clone.identifiers = clone.identifiers.filter(a => (a.old_identifier?.length ?? 1) > 0 && (a.new_identifier?.length ?? 1) > 0);

        // Set mappings
        api.send({
            type: "mappings",
            method: "set_block_mappings",
            mappings: clone
        }, function (message) {
            if (message.type === "error") {
                console.info("Failed to set mappings: " + message.error);
                self.app.showError(t("error.setMappings.title"), message.error, message.errorId, message.stackTrace, false);
            } else {
                self.convertSetBiomeMappings();
            }
        });
    };

    convertSetBiomeMappings = () => {
        let self = this;

        // Copy valid mappings
        let clone = {};
        for (const key in this.app.state.biomeMapping) {
            const value = this.app.state.biomeMapping[key];

            // If key and value are present move it to the clone
            if (key && value) clone[key] = value;
        }

        // Set biome mappings
        api.send({
            type: "mappings",
            method: "set_biome_mappings",
            biomes: clone
        }, function (message) {
            if (message.type === "error") {
                console.info("Failed to set biome mappings: " + message.error);
                self.app.showError(t("error.setBiomeMappings.title"), message.error, message.errorId, message.stackTrace, false);
            } else {
                self.convertStartConversion();
            }
        });
    };

    convertStartConversion = () => {
        let self = this;

        api.send({
            type: "flow",
            method: "convert",
            editing: this.app.state.outputType.id === this.app.state.inputType.id,
            outputType: this.app.state.outputType.id,
            ...this.app.state.converterSettings
        }, this.progress.pipe(function (message) {
            if (!self.mounted) return; // Not mounted ignore error
            if (message.type === "error") {
                console.info("Failed to convert: " + message.error);
                if (!message.cancelled) {
                    self.app.showError(t("error.convertWorld.title"), message.error, message.errorId, message.stackTrace, false);
                }
            } else if (message.type === "response") {
                self.app.setState({convertResult: message.output});
                self.nextScreen();
            } else {
                console.info("Unknown response", message);
            }
        }));
    };

    render() {
        let version = getVersionName(this.app.state.outputType.id);
        let label = this.app.state.outputType.label;

        return (
            <div className="maincol">
                <div className="topbar">
                    <h1>{t("processing.title")}</h1>
                    <h2>{t("processing.subtitle", {label: tt(label), version: version})}</h2>
                </div>
                {!this.progress.isErrored() && !this.progress.isCancelled() &&
                    <div className="main_content main_content_progress">
                        <ProgressComponent progress={this.progress} cancel={false}/>
                        <p>{t("processing.wait")}</p>
                        <p>{t("processing.enjoy")}</p>
                    </div>
                }
                {(this.progress.isErrored() || this.progress.isCancelled()) &&
                    <div className="main_content main_content_progress">
                        <ProgressComponent progress={this.progress} cancel={false}/>
                    </div>
                }
                <div className="bottombar">
                    {(this.progress.isErrored() || this.progress.isCancelled()) &&
                        <button onClick={() => window.location.reload()} type="submit"
                                className="button red">{t("common.restart")}</button>}
                    {(!this.progress.isErrored() && !this.progress.isCancelled()) &&
                        <button className="button red" onClick={() => this.progress.cancel()}>{t("common.cancel")}
                        </button>}
                    {(!this.progress.isErrored() && !this.progress.isCancelled()) &&
                        <button type="submit" className="button green" disabled="disabled">{t("processing.button")}</button>}
                </div>
            </div>
        );
    }
}