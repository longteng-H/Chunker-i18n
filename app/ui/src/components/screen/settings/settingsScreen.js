import React from "react";
import {BaseScreen} from "../baseScreen";
import {ProcessingScreen} from "../processing/processingScreen";
import {ModeScreen} from "../mode/modeScreen";
import "./settingsScreen.css"
import {PreviewTab} from "./tab/previewTab";
import {WorldSettingsTab} from "./tab/worldSettingsTab";
import {DimensionPruningTab} from "./tab/dimensionPruningTab";
import {PaletteMappingsTab} from "./tab/paletteMappingsTab";
import {BiomeMappingsTab} from "./tab/biomeMappingsTab";
import {ConverterSettingsTab} from "./tab/converterSettingsTab";
import {CLIExportTab} from "./tab/cliTab";
import {t} from "../../../i18n";

export class SettingsScreen extends BaseScreen {
    state = {
        tab: "preview"
    };

    nextScreen = () => this.app.setScreen(ProcessingScreen);
    previousScreen = () => this.app.setScreen(ModeScreen);

    getStage = () => {
        return 2;
    };

    switchTab = (name, e) => {
        this.setState({tab: name});
        e.preventDefault();
    };

    render() {
        return (
            <React.Fragment>
                <div className="sidebar">
                    <ul>
                        <li>
                            <button className={this.state.tab === "preview" ? "active" : ""}
                                    onClick={(e) => this.switchTab("preview", e)}>{t("settings.tab.preview")}
                            </button>
                        </li>
                        <li>
                            <button className={this.state.tab === "settings" ? "active" : ""}
                                    onClick={(e) => this.switchTab("settings", e)}>{t("settings.tab.settings")}
                            </button>
                        </li>
                        <li>
                            <button className={this.state.tab === "dimensions" ? "active" : ""}
                                    onClick={(e) => this.switchTab("dimensions", e)}>{t("settings.tab.dimensions")}
                            </button>
                        </li>
                        <li>
                            <button className={this.state.tab === "mappings" ? "active" : ""}
                                    onClick={(e) => this.switchTab("mappings", e)}>{t("settings.tab.mappings")}
                            </button>
                        </li>
                        <li>
                            <button className={this.state.tab === "biomes" ? "active" : ""}
                                    onClick={(e) => this.switchTab("biomes", e)}>{t("settings.tab.biomes")}
                            </button>
                        </li>
                        <li>
                            <button
                                className={this.state.tab === "converter" || this.state.tab === "api" ? "active" : ""}
                                onClick={(e) => this.switchTab("converter", e)}>{t("settings.tab.converter")}
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="maincol">
                    {this.state.tab === "preview" &&
                        <PreviewTab app={this.app}/>
                    }
                    {this.state.tab === "settings" &&
                        <WorldSettingsTab app={this.app}/>
                    }
                    {this.state.tab === "dimensions" &&
                        <DimensionPruningTab app={this.app}/>
                    }
                    {this.state.tab === "converter" &&
                        <ConverterSettingsTab app={this.app}/>
                    }
                    {this.state.tab === "cli" &&
                        <CLIExportTab app={this.app}/>
                    }
                    {this.state.tab === "mappings" &&
                        <PaletteMappingsTab app={this.app}/>
                    }
                    {this.state.tab === "biomes" &&
                        <BiomeMappingsTab app={this.app}/>
                    }

                    <div className="bottombar">
                        <button onClick={() => window.location.reload()} type="submit" className="button red">{t("common.restart")}
                        </button>
                        <button className="button magenta" onClick={this.previousScreen}>{t("settings.switchMode")}</button>
                        <button className="button green" onClick={this.nextScreen}>{t("common.convert")}</button>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}