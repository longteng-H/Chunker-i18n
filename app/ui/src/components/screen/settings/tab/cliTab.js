import React, {Component} from "react";
import {t} from "../../../../i18n";

export class CLIExportTab extends Component {
    app = this.props.app;

    generateCommand = () => {
        let outputType = this.app.state.outputType.id;
        let worldSettings = JSON.stringify(JSON.stringify(this.app.state.editedSettings));
        let pruningSettings = JSON.stringify(this.app.getPruningJSON());
        let dimensionMappings = JSON.stringify(this.app.getDimensionMappingsJSON());
        let customDimensions = JSON.stringify(this.app.getCustomDimensionsJSON());
        let biomeMappings = JSON.stringify(this.app.getBiomeMappingsJSON());
        let blockMappings = JSON.stringify(this.app.getBlockMappingsJSON());
        let converterSettings = JSON.stringify(JSON.stringify(this.app.state.converterSettings));

        return "java -jar chunker-cli.jar " +
            " --inputDirectory input" +
            " --outputDirectory output" +
            " --outputFormat " + outputType +
            (converterSettings.length === 4 ? "" : " --converterSettings " + converterSettings) +
            (worldSettings.length === 4 ? "" : " --worldSettings " + worldSettings) +
            (customDimensions.length === 4 ? "" : " --dimensionRegistry " + customDimensions) +
            (dimensionMappings.length === 4 ? "" : " --dimensionMappings " + dimensionMappings) +
            (biomeMappings.length === 4 ? "" : " --biomeMappings " + biomeMappings) +
            (blockMappings.length === 4 ? "" : " --blockMappings " + blockMappings) +
            (pruningSettings.length === 4 ? "" : " --pruning " + pruningSettings) +
            (outputType === this.app.state.inputType.id ? " --keepOriginalNBT" : "");
    };

    render() {
        return (
            <div>
                <React.Fragment>
                    <div className="topbar">
                        <h1>{t("cli.title")}</h1>
                        <h2>{t("cli.subtitle")}</h2>
                    </div>
                    <div className="main_content settings dimensions api">
                        <div>
                            <h4 style={{marginBlockEnd: "5px", marginBlockStart: "1px"}}>{t("cli.exampleUsage")}</h4>
                        </div>
                        <div className="white_box">
                            <label className="legend" htmlFor="name">
                                <span className="tooltip">{t("cli.commandTooltip")}</span>
                                {t("cli.commandLabel")}
                            </label>
                            <input type="text" value={this.generateCommand()} readOnly={true}/>
                        </div>
                        <div>
                            <hr/>
                            <h4 style={{marginBlockEnd: "5px"}}>{t("cli.parameters")}</h4>
                        </div>
                        <div className="white_box">
                            <label className="legend" htmlFor="name">
                                <span className="tooltip">{t("cli.outputFormat.tooltip")}</span>--outputFormat
                            </label>
                            <input type="text"
                                   value={this.app.state.outputType.id}
                                   readOnly={true}/>
                        </div>
                        <div className="white_box">
                            <label className="legend" htmlFor="name">
                                    <span
                                        className="tooltip">{t("cli.converterSettings.tooltip")}</span>--converterSettings
                            </label>
                            <input type="text" value={JSON.stringify(this.app.state.converterSettings)}
                                   readOnly={true}/>
                        </div>
                        <div className="white_box">
                            <label className="legend" htmlFor="name">
                                <span className="tooltip">{t("cli.worldSettings.tooltip")}</span>--worldSettings
                            </label>
                            <input type="text" value={JSON.stringify(this.app.state.editedSettings)}
                                   readOnly={true}/>
                        </div>
                        <div className="white_box">
                            <label className="legend" htmlFor="name">
                                <span className="tooltip">{t("cli.dimensionMappings.tooltip")}</span>--dimensionMappings
                            </label>
                            <input type="text" value={this.app.getDimensionMappingsJSON()} readOnly={true}/>
                        </div>
                        <div className="white_box">
                            <label className="legend" htmlFor="name">
                                <span className="tooltip">{t("cli.pruning.tooltip")}</span>--pruning
                            </label>
                            <input type="text" value={this.app.getPruningJSON()} readOnly={true}/>
                        </div>
                        <div className="white_box">
                            <label className="legend" htmlFor="name">
                                <span className="tooltip">{t("cli.dimensionRegistry.tooltip")}</span>--dimensionRegistry
                            </label>
                            <input type="text" value={this.app.getCustomDimensionsJSON()} readOnly={true}/>
                        </div>
                        <div className="white_box">
                            <label className="legend" htmlFor="name">
                                <span className="tooltip">{t("cli.biomeMappings.tooltip")}</span>--biomeMappings
                            </label>
                            <input type="text" value={this.app.getBiomeMappingsJSON()} readOnly={true}/>
                        </div>
                        <div className="white_box">
                            <label className="legend" htmlFor="name">
                                <span className="tooltip">{t("cli.blockMappings.tooltip")}</span>--blockMappings
                            </label>
                            <input type="text" value={this.app.getBlockMappingsJSON()} readOnly={true}/>
                        </div>
                    </div>
                </React.Fragment>
            </div>
        );
    }
}