import React, {Component} from "react";
import {getLang, getLanguages, setLang, t} from "../../i18n";

export class Footer extends Component {
    switchLanguage = (langId, e) => {
        e.preventDefault();
        setLang(langId);
    };

    render() {
        return (<footer id="footer">
                <nav className="footer_top">
                    <div className="wrapper">
                        <ul>
                            <li><a href="https://github.com/HiveGamesOSS/Chunker" target="_blank"
                                   rel="noopener noreferrer">GitHub</a></li>
                            <li><a href="https://github.com/HiveGamesOSS/Chunker/network/dependencies" target="_blank"
                                   rel="noopener noreferrer">{t("footer.attributions")}</a></li>
                            <li className="language_switch">
                                {getLanguages().map((language, index) => (
                                    <React.Fragment key={language.id}>
                                        {index !== 0 && <span className="language_divider"> | </span>}
                                        <button type="button"
                                                className={getLang() === language.id ? "active" : undefined}
                                                onClick={(e) => this.switchLanguage(language.id, e)}>{language.name}</button>
                                    </React.Fragment>
                                ))}
                            </li>
                        </ul>
                    </div>
                </nav>
                <div className="wrapper">
                    <div className="footer_bottom">
                        <a href="https://hivegames.io" target="_blank" rel="noopener noreferrer"><img
                            src="images/hive.png"
                            alt="Hive Logo"/></a>
                        <p>{t("footer.madeBy")}<br/><span
                            className="copy">&copy; Hive Games Limited {new Date().getFullYear()}</span>
                        </p>
                        <span className="build">
                        {(window.chunker && window.chunker.version) || "unknown"}-{(window.chunker && window.chunker.gitVersion) || "unknown"}
                    </span>
                    </div>
                </div>
            </footer>
        );
    }
}
