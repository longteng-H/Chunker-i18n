import React, {PureComponent} from "react";
import {BiomeSelector} from "./biomeSelector";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {t} from "../../../../../i18n";

export class BiomeMapping extends PureComponent {
    render() {
        return (
            <div className="mappings-row">
                <div className="mappings-entry">
                    <BiomeSelector
                        placeholder={t("biomeMapping.selectInput")}
                        identifier={this.props.value.old_identifier}
                        suggestions={this.props.inputBiomeSuggestions}
                        onChange={(identifier) => {
                            let clone = Object.assign({}, this.props.value);
                            clone.old_identifier = identifier;
                            this.props.onChange(clone);
                        }}
                    />
                </div>
                <div className="mappings-entry">
                    <BiomeSelector
                        placeholder={t("biomeMapping.selectOutput")}
                        identifier={this.props.value.new_identifier}
                        suggestions={this.props.outputBiomeSuggestions}
                        onChange={(identifier) => {
                            let clone = Object.assign({}, this.props.value);
                            clone.new_identifier = identifier;
                            this.props.onChange(clone);
                        }}
                    />
                </div>
                <div className="mappings-delete">
                    <button
                        className="icon-button"
                        title={t("mapping.deleteEntry")}
                        disabled={!this.props.canDelete}
                        onClick={this.props.onDelete}
                    >
                        <FontAwesomeIcon icon={faTimes}/>
                    </button>
                </div>
            </div>
        );
    }
}
