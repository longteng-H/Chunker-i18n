import en from "./locales/en.json";
import zhCN from "./locales/zh-CN.json";

const LOCALES = {
    "en": en,
    "zh-CN": zhCN
};

const STORAGE_KEY = "chunker.lang";

function detectDefaultLanguage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && LOCALES[stored]) return stored;
    } catch (error) {
        // Storage unavailable, fall through to detection
    }
    const language = navigator.language || "en";
    return language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

let currentLang = detectDefaultLanguage();
const listeners = new Set();

export function getLang() {
    return currentLang;
}

export function getLanguages() {
    return [
        {id: "en", name: "English"},
        {id: "zh-CN", name: "简体中文"}
    ];
}

export function setLang(lang) {
    if (!LOCALES[lang] || lang === currentLang) return;
    currentLang = lang;
    try {
        localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
        // Storage unavailable, language applies to this session only
    }
    document.documentElement.lang = lang;
    listeners.forEach((listener) => listener(lang));
}

export function onLangChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

// Translate a key with optional {name} interpolation
export function t(key, params) {
    let text = LOCALES[currentLang]?.[key] ?? LOCALES.en[key] ?? key;
    if (params !== undefined) {
        for (const [name, value] of Object.entries(params)) {
            text = text.split("{" + name + "}").join(String(value));
        }
    }
    return text;
}

// Translate strings which originate from the backend / data files,
// falls back to the input when no translation is available
export function tt(text) {
    if (text === undefined || text === null) return text;
    return LOCALES[currentLang]?.["backend." + text] ?? text;
}

document.documentElement.lang = currentLang;
