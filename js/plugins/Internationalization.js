//=============================================================================
// Internationalization.js
//=============================================================================

/*:
 * @plugindesc Adds support for internationalization (i18n) to RPG Maker MV, allowing translations of in-game text into multiple languages.
 * @author hckoalla
 *
 * @param DefaultLanguage
 * @text Default Language
 * @type text
 * @desc The default language to load if no saved language is found.
 * @default enUS
 *
 * @help This plugin provides the following functionality:
 * - Load translations from JSON files based on the selected language.
 * - Use a script call to translate text dynamically: i18n.translate("key").
 * - Change the language during the game with i18n.load("languageCode").
 *
 * File Structure:
 * Place translation files in a "locales" folder within your project directory.
 * Example:
 *   locales/enUS.json
 *   locales/ptBR.json
 *
 * JSON File Format:
 * Each JSON file should contain key-value pairs for text translations.
 * Example (enUS.json):
 * {
 *   "greeting": "Hello, adventurer!",
 *   "farewell": "Goodbye, brave one."
 * }
 *
 * Usage:
 * Use script calls in events to translate text or dynamically change the language.
 * Example:
 * - To display a translated text: i18n.translate("greeting").
 * - To switch to Portuguese: i18n.load("ptBR").
 *
 * Note:
 * This plugin does not provide additional plugin commands in the editor.
 */

(function() {
    var parameters = PluginManager.parameters('Internationalization');
    var defaultLanguage = parameters['DefaultLanguage'] || 'enUS';
    var languageConfigFile = 'languageConfig.json';

    var currentLanguage = defaultLanguage;
    var translations = {};

    function loadSavedLanguage() {
        var xhr = new XMLHttpRequest();
		try{
			xhr.open("GET", languageConfigFile, false); // Synchronous to ensure loading before use
		} catch (e) {
			saveLanguage(defaultLanguage);
			xhr.open("GET", languageConfigFile, false);
        }
        try {
            xhr.send();
            if (xhr.status === 200) {
                var config = JSON.parse(xhr.responseText);
                if (config.language) {
                    currentLanguage = config.language;
                }
            }
        } catch (e) {
            console.warn("No saved language config found. Using default.");
        }
    }

    function saveLanguage(language) {
        var fs = require('fs');
        var path = require('path');
        var filePath = path.join(StorageManager.localFileDirectoryPath(), languageConfigFile);
        fs.writeFileSync(filePath, JSON.stringify({ language: language }, null, 2));
    }

    function loadTranslations(language) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "locales/" + language + ".json", true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                translations = JSON.parse(xhr.responseText);
                currentLanguage = language;
                saveLanguage(language);
            } else {
                console.error("Failed to load language: " + language);
            }
        };
        xhr.onerror = function() {
            console.error("Error loading language file: " + language);
        };
        xhr.send();
    }

    function t(key) {
        return translations[key] || key;
    }

    // Public API
    window.i18n = {
        load: loadTranslations,
        translate: t,
        currentLanguage: function() { return currentLanguage; }
    };

    // Load saved language or default language
    loadSavedLanguage();
    loadTranslations(currentLanguage);
})();
