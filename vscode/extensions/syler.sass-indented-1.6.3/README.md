[![](https://vsmarketplacebadge.apphb.com/version-short/syler.sass-indented.svg)](https://marketplace.visualstudio.com/items?itemName=syler.sass-indented)
[![](https://vsmarketplacebadge.apphb.com/rating-short/syler.sass-indented.svg)](https://marketplace.visualstudio.com/items?itemName=syler.sass-indented)
[![](https://vsmarketplacebadge.apphb.com/installs-short/syler.sass-indented.svg)](https://marketplace.visualstudio.com/items?itemName=syler.sass-indented)
[![GitHub stars](https://img.shields.io/github/stars/TheRealSyler/vscode-sass-indented.svg?style=social&label=Star%20on%20Github)](https://github.com/TheRealSyler/vscode-sass-indented)
[![GitHub issues](https://img.shields.io/github/issues-raw/TheRealSyler/vscode-sass-indented?color=%232a2)](https://github.com/TheRealSyler/vscode-sass-indented)
[![Maintenance](https://img.shields.io/maintenance/yes/2019.svg)](https://GitHub.com/TheRealSyler/vscode-sass-indented/graphs/commit-activity)

# _Indented Sass syntax highlighting, autocomplete & Formatter for VSCode_

## **_Installing_**

Search for Sass from the extension installer within VSCode or put this into the command palette.

```cmd
ext install sass-indented
```

## **Features**

> Syntax Highlighting

> AutoCompletions

> [Formatter](#formatter)

#### 1.6.3 new additions

> Fixed some formatter issues
> Added The formatter ignores the next line with this comment `///I`

---

> Note: abbreviations and sass snippets have been moved to a separate [extension](https://marketplace.visualstudio.com/items?itemName=syler.sass-next).

> Note: The snippets have been removed if you still want to use them, you can get them [here](https://github.com/TheRealSyler/vscode-sass-indented/blob/a3ffc7a005c2ccd82e7c50ccf391ba5d22afee13/snippets/sass.json).

### **Formatter**

##### Commands

1. `///S` The formatter ignores empty lines until the next class, id or mixin.
2. `///R` The formatter uses the beginning of the command as the current indentation level.
3. `///I` The formatter ignores the next line.

Options can be set in the [Configuration](#Configuration)

![Formatter Example](https://media.giphy.com/media/fXhWNUfxr2bFNqgHzk/giphy.gif)

## **Configuration**

Configuration options can be set in the `Sass (Indented)` section of VSCode settings or by editing your `settings.json` directly.

### General

| Option                       | Type    | Default                                     | Description                                                                                               |
| ---------------------------- | ------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `sass.lint.enable`           | boolean | false                                       | Enables sass lint.                                                                                        |
| `sass.disableAutoIndent`     | boolean | false                                       | Stop the extension from automatically indenting when pressing Enter                                       |
| `sass.disableUnitCompletion` | boolean | true                                        | adds units to the intellisense completions if false.                                                      |
| `sass.andStared`             | array   | `["active", "focus", "hover", "nth-child"]` | items in this array will be at the top of the completion list (only for items that show after the & sign) |

### Formatter

| Option                         | Type    | Default | Description                                                    |
| ------------------------------ | ------- | ------- | -------------------------------------------------------------- |
| `sass.format.enabled`          | boolean | true    | enables the sass formatter.                                    |
| `sass.format.deleteWhitespace` | boolean | true    | removes trailing whitespace.                                   |
| `sass.format.deleteEmptyRows`  | boolean | true    | removes empty rows.                                            |
| `sass.format.deleteCompact`    | boolean | true    | removes empty rows that are near a property.                   |
| `sass.format.setPropertySpace` | boolean | true    | If true space between the property: value, is always set to 1. |

## **Bugs**

If you encounter any bugs please [open a new issue](https://github.com/TheRealSyler/vscode-sass-indented/issues/new?assignees=TheRealSyler&labels=bug&template=bug_report.md&title=).

## **Contributing**

The source for this extension is available on [github](https://github.com/TheRealSyler/vscode-sass-indented). If anyone feels that there is something missing or would like to suggest improvements please [open a new issue](https://github.com/TheRealSyler/vscode-sass-indented/issues/new?assignees=TheRealSyler&labels=enhancement&template=feature_request.md&title=) or send a pull request! Instructions for running/debugging extensions locally [here](https://code.visualstudio.com/docs/extensions/overview).

## **Credits**

- Thanks to [@robinbentley](https://github.com/robinbentley) for creating and maintaining the project until version 1.5.1.
- Property/Value Autocompletion - [Stanislav Sysoev (@d4rkr00t)](https://github.com/d4rkr00t) for his work on [language-stylus](https://github.com/d4rkr00t/language-stylus) extension
- Syntax highlighting - [https://github.com/P233/Syntax-highlighting-for-Sass](https://github.com/P233/Syntax-highlighting-for-Sass)
- Sass seal logo - [http://sass-lang.com/styleguide/brand](http://sass-lang.com/styleguide/brand)

## Changelog

The full changelog is available here: [changelog](https://github.com/TheRealSyler/vscode-sass-indented/blob/master/CHANGELOG.md).

## License

[MIT - https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)
