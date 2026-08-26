import en from "./settings.json";
import zhCN from "./settings.zh-CN.json";
import {getLang} from "../../../../../i18n";

// Returns the world settings merge data for the current language
export function getMergeSettings() {
    return getLang() === "zh-CN" ? zhCN : en;
}
