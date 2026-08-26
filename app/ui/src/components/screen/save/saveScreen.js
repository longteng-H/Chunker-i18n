import React from "react";
import {BaseScreen} from "../baseScreen";
import api from "../../../api";
import {Round2DP} from "../../progress";
import {getVersionName} from "../mode/modeOption";
import {saveAs} from "file-saver";
import {t, tt} from "../../../i18n";

export class SaveScreen extends BaseScreen {
    state = {
        modalShown: false,
        saving: false,
        saved: false,
        percentage: 0
    };

    getStage = () => {
        return 4;
    };

    onClick = (e) => {
        let self = this;
        e.preventDefault();

        // Call the save
        api.send({type: "flow", method: "save", url: this.app.state.convertResult.download}, (message) => {
            if (message.type === "error") {
                self.setState({
                    saving: false,
                    saved: false
                })
                self.app.showError(t("error.saveFailed.title"), tt(message.error), message.errorId, message.stackTrace, true);
            } else if (message.type === "response") {
                self.setState({
                    saving: false,
                    saved: true
                })
            } else if (message.type === "progress") {
                self.setState({
                    saving: true,
                    saved: false,
                    percentage: message.percentage * 100
                })
            }
        });
    };

    openModal = () => this.setState({modalShown: true});

    closeModal = () => this.setState({modalShown: false});

    getOutputLog = () => {
        // Convert to nice identifiers
        return t("save.logHeader") + this.app.state.convertResult.missingIdentifiers.map(a => {
            return a.identifier + (a.states ? "[" + a.states.states.map(s => s.item1 + "=" + s.item2.value).join(",") + "]" : "")
        }).join("\n");
    };

    saveLog = () => {
        let blob = new Blob([this.getOutputLog()], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "output-log.txt");
    };

    render() {
        // Version info
        let version = getVersionName(this.app.state.outputType.id);
        let label = this.app.state.outputType.label;

        // Error IDs
        let errorIds = this.app.state.convertResult.anonymousId !== "" ? this.app.state.convertResult.anonymousId : undefined;

        // Get the log
        let outputLog = this.getOutputLog();

        return (
            <div className="maincol">
                <div className="topbar">
                    <h1>{t("save.title")}</h1>
                    <h2>{t("save.subtitle", {label: tt(label), version: version})}</h2>
                </div>
                <div className="main_content main_content_progress">
                    {!this.state.saved && !this.state.saving && <h3>{t("save.readyToSave")}</h3>}
                    {this.state.saving && <React.Fragment>
                        <h3>{t("save.savingPercent", {percent: Round2DP(this.state.percentage)})}</h3>
                        <div className="progress_bar">
                            <div className="progress_fill" style={{width: this.state.percentage + "%"}}/>
                        </div>
                    </React.Fragment>}
                    {this.state.saved && <h3>{t("save.saved")}</h3>}
                    {this.state.saved && <p>{t("save.savedMsg")}</p>}
                    {!this.state.saved && <p>{t("save.canSaveMsg")}</p>}
                    {errorIds && (
                        <div>
                            <h1>{t("save.errorsTitle")}</h1>
                            <p>{t("save.errorsMsgBefore")} <span
                                    className="world_name">{errorIds}</span>
                            </p>
                        </div>
                    )}
                    {this.app.state.convertResult.missingIdentifiers.length > 0 &&
                        <div>
                            <button className="button blue" onClick={this.openModal}>{t("save.showOutputLog")}</button>
                        </div>
                    }
                </div>
                {this.state.modalShown && <div className="modal_overlay">
                    <div className="modal">
                        <h3>{t("save.outputLog")}</h3>
                        <textarea className="output-log" readOnly={true} value={outputLog}/>
                        <br/>
                        <p>
                            <button className="button blue" onClick={this.saveLog}>{t("save.saveLog")}</button>
                            <button className="button green" onClick={this.closeModal}>{t("common.close")}</button>
                        </p>
                    </div>
                </div>}
                <div className="bottombar">
                    <button onClick={() => window.location.reload()} type="submit" className="button red">{t("common.restart")}
                    </button>
                    <a download rel="noopener noreferrer" href={this.app.state.convertResult.download}
                       onClick={this.onClick} className="button green">{t("common.save")}</a>
                </div>
            </div>
        );
    }
}