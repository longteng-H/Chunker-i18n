import React from "react";
import {BaseScreen} from "../baseScreen";
import {ModeScreen} from "../mode/modeScreen";
import api from "../../../api";
import {Round2DP} from "../../progress";
import {t, tt} from "../../../i18n";

export class SelectWorldScreen extends BaseScreen {
    state = {
        version: undefined,
        detecting: false,
        progress: 0,
        animated: false,
        selected: undefined,
        filePath: undefined,
        filePathDirectory: undefined,
        processing: false,
        processingPercentage: 0,
        dragging: false,
        draggingOverBox: false
    };
    fileInput = undefined;
    folderInput = undefined;
    target = null;
    jokeIndex = Math.floor(Math.random() * 5);

    constructor(props) {
        super(props);

        let self = this;
        // Setup fileInput
        this.fileInput = document.createElement("input");
        this.fileInput.type = "file";
        this.fileInput.accept = ".zip,.mcworld,.mctemplate,.tar,.tar.gz,.tgz,.tar.br,.tbr";
        this.fileInput.value = null;
        this.fileInput.onclick = () => {
            self.fileInput.value = null;
        };
        this.fileInput.onchange = () => this.handleData(this.wrapFiles(self.fileInput.files));

        // Setup folderInput
        this.folderInput = document.createElement("input");
        this.folderInput.type = "file";
        this.folderInput.webkitdirectory = true;
        this.folderInput.directory = true;
        this.folderInput.multiple = true;
        this.folderInput.value = null;
        this.folderInput.onclick = () => {
            self.folderInput.value = null;
        };
        this.folderInput.onchange = () => this.handleData(this.wrapFiles(self.folderInput.files));
    }

    wrapFiles = (files) => {
        return Array.from(files).map(file => ({
            path: "/" + ((file.webkitRelativePath ?? "") === "" ? file.name : file.webkitRelativePath),
            file: file
        }));
    };

    handleData = (files) => {
        let self = this;

        if (files.length > 1) {
            this.setState({
                selected: files[0].path.split('/')[1],
                processing: true,
                processingPercentage: 0
            });

            let level = null;
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                if (file.path.endsWith("/level.dat")) {
                    let fullPath = window.chunker.getPathForFile(file.file);
                    level = fullPath.substring(0, fullPath.lastIndexOf("level.dat"));
                }
            }
            if (level) {
                self.setState({filePath: level, filePathDirectory: true, processing: false});
            } else {
                this.app.showError(t("select.error.invalidWorld.title"), t("select.error.invalidWorld.body"), null, undefined, true);
                this.setState({selected: false, detecting: false, processing: false});
            }
        } else {
            let fullPath = window.chunker.getPathForFile(files[0].file);
            this.setState({selected: files[0].path.split('/')[1], filePath: fullPath, filePathDirectory: false});
        }
    };

    // Functions from https://gist.github.com/is-already-taken/0aa646eb5f164a656a422fc75bc7a2c6
    getFiles = (entriesList) => {
        let self = this;
        if (entriesList instanceof Array) {
            return Promise.all(entriesList.map(self.getFiles));
        } else {
            return new Promise((resolve, reject) => {
                entriesList.file((file) => resolve({
                    path: entriesList.fullPath,
                    file: file
                }), reject);
            });
        }
    };

    readEntriesAsync = (rootEntry) => {
        let reader = rootEntry.createReader();
        let entriesArr = [];

        return new Promise((resolve, reject) => {
            reader.readEntries((entries) => {
                entries.forEach((entry) => {
                    entriesArr.push(entry);
                });

                resolve(entriesArr);
            }, reject);
        });
    };

    walkEntriesAsync = (node) => {
        let self = this;
        if (node.isDirectory) {
            return new Promise((resolve, reject) => {
                self.readEntriesAsync(node).then((entries) => {
                    let dirPromises = entries.map((dir) => self.walkEntriesAsync(dir));

                    return Promise.all(dirPromises).then((fileSets) => {
                        resolve(fileSets);
                    });
                });
            });
        } else {
            return Promise.resolve(node);
        }
    };

    onDrop = (e) => {
        e.preventDefault();
        this.setState({dragging: false, draggingOverBox: false});

        // Validate data
        if (e.dataTransfer === undefined) return;
        if (e.dataTransfer.items === undefined) return;
        if (e.dataTransfer.items.length === 0) return;

        // Loop through entries
        let promises = [];
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
            let item = e.dataTransfer.items[i];
            let entry = item.webkitGetAsEntry();
            promises.push(this.walkEntriesAsync(entry).then(this.getFiles));
        }

        Promise.all(promises).then((result) => {
            let list = result.flat(10);

            // Ask the uploader to handle it
            this.handleData(list);
        });
    };

    onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "none";
    };

    onDragEnter = (e) => {
        e.preventDefault();
        this.target = e.target;
        this.setState({dragging: true});
    };

    onDragBoxOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
        this.setState({draggingOverBox: true});
    };

    onDragStop = (e) => {
        e.preventDefault();
        if (e.target !== this.target) return;
        this.setState({dragging: false});
    };

    onDragBoxStop = (e) => {
        this.setState({draggingOverBox: false});
    };

    nextScreen = () => this.app.setScreen(ModeScreen);

    showFileBrowser = () => this.fileInput.click();

    showFolderBrowser = () => this.folderInput.click();

    startSession = () => {
        // Mark as detecting file
        this.setState({
            detecting: true,
            progress: 0,
        });

        // Do request
        let self = this;

        // Check selected type (if it's a file)
        let name = this.state.filePath.toLowerCase();
        let supportedExtensions = [".zip", ".mcworld", ".mctemplate", ".tar", ".tar.gz", ".tgz", ".tar.br", ".tbr"];
        if (!this.state.filePathDirectory && !supportedExtensions.some(extension => name.endsWith(extension))) {
            self.app.showError(t("select.error.loadWorld.title"), t("select.error.unsupportedFile.body"), undefined, undefined, false);
            return;
        }

        // Make the connection
        this.makeConnection(() => {
            api.send({
                type: "flow",
                method: "select_world",
                path: self.state.filePath,
            }, (message) => {
                if (message.type === "response") {
                    // Update session
                    self.app.updateSession(message.output);

                    // Goto next screen
                    self.setState({
                        detecting: false
                    });
                    self.app.generateSettings();
                    self.nextScreen();
                } else if (message.type === "progress") {
                    // Update progress
                    self.setState({
                        progress: message.percentage * 100
                    });
                } else if (message.type === "progress_state") {
                    // Update progress state
                    self.setState({
                        progress: message.percentage * 100,
                        animated: message.animated
                    });
                } else {
                    // Attempt to find the actual error
                    console.info("Could not make request :(", message);
                    if (message?.error) {
                        self.app.showError(t("select.error.loadWorld.title"), tt(message.error), message.errorId, message.stackTrace, false);
                    } else {
                        self.app.showError(t("select.error.loadWorld.title"), t("select.error.backendComm.body"), undefined, undefined, false, true);
                    }
                }
            });
        });
    };

    cancel = () => {
        this.setState({selected: false, detecting: false, processing: false});
    };

    makeConnection = (callback) => {
        let self = this;
        let ignoreError = false;

        // Ensure we don't show errors if the user is reloading the page
        let listener = () => ignoreError = true;
        window.addEventListener("beforeunload", listener);

        // Connect to the API
        api.connect(function (errorCode) {
            if (api.isConnected()) {
                callback();
            } else if (!ignoreError) {
                if (errorCode === 529) {
                    self.app.showError(t("select.error.connect.title"), t("select.error.tooManyRequests.body"), null, undefined, false, true);
                } else if (errorCode === 408) {
                    self.app.showError(t("select.error.connect.title"), t("select.error.timeout.body"), null, undefined, false, true);
                } else if (errorCode === -100) {
                    self.app.showError(t("select.error.connect.title"), t("select.error.cannotRun.body"), null, undefined, false, true);
                } else if (errorCode === 1) {
                    self.app.showError(t("select.error.connect.title"), t("select.error.killed.body"), null, undefined, false, true);
                } else if (errorCode === 12) {
                    self.app.showError(t("select.error.oom.title"), t("select.error.oom.body"), null, undefined, false, true);
                } else {
                    self.app.showError(t("select.error.connect.title"), t("select.error.backendComm.body"), null, undefined, false, true);
                }

                // Remove window listener
                window.removeEventListener("beforeunload", listener)
            }
        });
    };

    componentDidMount() {
        super.componentDidMount();

        // Add listener for window drag and drop
        document.addEventListener("dragover", this.onDragOver);
        window.addEventListener("dragenter", this.onDragEnter);
        window.addEventListener("dragleave", this.onDragStop);
    }

    componentWillUnmount() {
        // Remove listener for window drag and drop
        document.removeEventListener("dragover", this.onDragOver);
        window.removeEventListener("dragenter", this.onDragEnter);
        window.removeEventListener("dragleave", this.onDragStop);
    }

    getJoke = () => {
        return [t("select.joke1"), t("select.joke2"), t("select.joke3"), t("select.joke4"), t("select.joke5")][this.jokeIndex];
    };

    render() {
        return (
            <div className={"maincol"}>
                <div className="topbar">
                    <h1>{t("select.title")}</h1>
                    <h2>{t("select.subtitle")}</h2>
                </div>
                {!this.state.selected && !this.state.dragging &&
                    <div className="main_content select_world">
                        <div className="select_world_options">
                            <button onClick={this.showFolderBrowser} className="gray_box">
                                {t("select.chooseFolder")}
                                <span>{t("select.chooseFolderHint")}</span>
                            </button>
                            <button onClick={this.showFileBrowser} className="gray_box">
                                {t("select.selectArchive")}
                                <span>{t("select.selectArchiveHint")}</span>
                            </button>
                        </div>
                    </div>
                }
                {!this.state.selected && this.state.dragging &&
                    <div className="main_content select_world">
                        <button
                            className={"gray_box drag_box" + (this.state.draggingOverBox ? " dragged_over" : "")}
                            onDrop={this.onDrop} onDragOver={this.onDragBoxOver} onDragLeave={this.onDragBoxStop}>
                            {t("select.dropHere")}
                            <span>{t("select.dropTypes")}</span>
                        </button>
                    </div>
                }
                {this.state.selected && this.state.processing &&
                    <div className="main_content main_content_progress">
                        <h3>{t("select.preparing")} <span>{Round2DP(this.state.processingPercentage)}%</span></h3>
                        <div className="progress_bar">
                            <div className="progress_fill" style={{width: this.state.processingPercentage + "%"}}/>
                        </div>
                        <p>{t("select.prepareWaitLong")}</p>
                    </div>
                }
                {this.state.selected && !this.state.processing && !this.state.detecting &&
                    <div className="main_content main_content_progress">
                        <h3>{t("select.worldSelected")}</h3>
                        <p>{t("select.readyToLoadBefore")}<span className="world_name">{this.state.selected}</span>{t("select.readyToLoadAfter")}
                        </p>
                    </div>
                }
                {this.state.selected && !this.state.processing && this.state.detecting &&
                    <div className="main_content main_content_progress">

                        {!this.state.animated &&
                            <h3>{t("select.preparing")} <span>{Round2DP(this.state.progress)}%</span></h3>}
                        {this.state.animated && <h3>{t("select.detectingVersion")}</h3>}
                        <div className={this.state.animated ? "progress_bar animated" : "progress_bar"}>
                            {!this.state.animated &&
                                <div className="progress_fill" style={{width: this.state.progress + "%"}}/>}
                        </div>
                        {!this.state.animated && <p>{t("select.prepareWait")}</p>}
                        {this.state.animated &&
                            <p>{t("select.detectWait")}</p>}
                        <p>{this.getJoke()}</p>
                    </div>
                }
                <div className="bottombar">
                    {this.state.selected && !this.state.processing && !this.state.detecting &&
                        <button className="button red" onClick={this.cancel}>{t("common.cancel")}</button>
                    }
                    <button
                        className="button green"
                        disabled={this.state.detecting || !this.state.selected || this.state.processing}
                        onClick={this.startSession}>{t("common.start")}
                    </button>
                </div>
            </div>
        );
    }
}
