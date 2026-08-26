import React, {Component} from "react";
import {t} from "../../i18n";

export class ErrorDisplay extends Component {
    modal = React.createRef();
    state = {
        title: t("error.couldNotLoad.title"),
        body: t("error.couldNotLoad.body"),
        canClose: true,
        stackTrace: undefined,
        errorId: undefined
    };

    render() {
        let url = this.props.app.generateIssueLink(this.state.body, this.state.stackTrace);
        return (
            <div className="modal_overlay">
                <div className="modal">
                    <h3>{t("error.oops", {title: this.state.title})}</h3>
                    <p>{this.state.body}<br/>{t("error.reportBefore")}<a target="_blank"
                                                                                       rel="noreferrer"
                                                                                       href={url}>{t("error.reportLink")}</a>{t("error.reportAfter")}
                    </p>
                    <p>
                        {this.state.canClose &&
                            <button className="button green" onClick={this.props.close}>{t("common.close")}</button>
                        }
                        {!this.state.canClose &&
                            <button className="button blue" onClick={() => document.location.reload()}>{t("common.restart")}</button>
                        }
                    </p>
                    {this.state.errorId &&
                        <p>{t("error.identifier")} <span className="code">{this.state.errorId}</span></p>
                    }
                </div>
            </div>
        );
    }
}
