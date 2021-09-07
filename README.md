# Gnome Bedtime Mode ![](./extras/images/bedtime-mode-icon.svg)

Hey Gnome, it's bedtime!

Converts to grayscale the entire Gnome workspace by using a smooth transition. Best to use during evening/night.

This behaviour is similar to Android's bedtime mode which converts the phone screen to grayscale. It should somewhat make your device less appealing and limit the usage of it before bedtime. On my side, at least, it still requires a fair amount of self control in order to make that happen.

The extension has a nice Preferences (Settings) UI where you can customize it to your liking. You can set an automatic schedule for turning on/off the Bedtime Mode, add an On Demand button to Top Bar or System Menu, etc. Just give it a try! :sunglasses:

![](./extras/images/screenshot.png)

# Installation

From the official GNOME Shell Extensions website:

[ego]: https://extensions.gnome.org/extension/4012/bedtime-mode/

[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][ego]

Or

[latest]: https://github.com/ionutbortis/gnome-bedtime-mode/releases/download/v4.0/gnome-bedtime_4.0.zip

You can download the [latest release package][latest] and manually install it to your extensions folder. Supported Gnome versions are 3.36, 3.38 and yes, Gnome 40!

```
wget https://github.com/ionutbortis/gnome-bedtime-mode/releases/download/v4.0/gnome-bedtime_4.0.zip
# (Or manually download via browser and run the next commands from the download folder)

extension_home=~/.local/share/gnome-shell/extensions/gnomebedtime@ionutbortis.gmail.com

mkdir -p $extension_home && rm -rf $extension_home/* && unzip gnome-bedtime_4.0.zip -d $extension_home
```

Then press `Alt`+`F2`, type `r` in the dialog window and press `Enter`.

You can now enable the extension by running the Extensions app (search and install it from your distro repos or get it from [here](https://flathub.org/apps/details/org.gnome.Extensions)), or by
browsing to https://extensions.gnome.org/local.

Alternatively, you can enable/disable the extension from command line:

```
gnome-extensions enable gnomebedtime@ionutbortis.gmail.com
gnome-extensions disable gnomebedtime@ionutbortis.gmail.com
```

# Keyboard shortcut

If you want to use a keyboard shortcut in order to toggle the Bedtime Mode then you can do this:

- Go to Settings -> Keyboard Shortcuts
- Scroll to the end and press the "+" button
- Fill the inputs with the following
  - Name: Toggle Bedtime Mode
  - Command:

```
bash -c 'schema_id=org.gnome.shell.extensions.bedtime-mode; schema_dir=~/.local/share/gnome-shell/extensions/gnomebedtime@ionutbortis.gmail.com/schemas/; if [[ $(gsettings --schemadir $schema_dir get $schema_id bedtime-mode-active) == "true" ]]; then turn_on=false; else turn_on=true; fi; gsettings --schemadir $schema_dir set $schema_id bedtime-mode-active $turn_on;'
```

- Press Set Shortcut and use your preffered one
- Done!

# Credits

Credits for inspiration go to:

- [Desaturate All](https://extensions.gnome.org/extension/1102/desaturate-all/) extension | [Github URL](https://github.com/laerne/desaturate_all)
- [Tint All](https://extensions.gnome.org/extension/1471/tint-all/) extension | [Github URL](https://github.com/amarovita/tint-all)
- [Night Theme Switcher](https://extensions.gnome.org/extension/2236/night-theme-switcher/) extension | [Gitlab URL](https://gitlab.com/rmnvgr/nightthemeswitcher-gnome-shell-extension/)

I wrote this extension because I use daily the Android's Bedtime Mode and I wanted something similar for my laptop. I'm a new linux user (using only Ubuntu now on my daily driver laptop) and I liked the idea of extending the desktop to your liking. It was also a good way to improve on my JavaScript coding skills.

Many thanks to the creator of the [Night Theme Switcher](https://gitlab.com/rmnvgr/nightthemeswitcher-gnome-shell-extension/) extension. I used his code for reference since the Gnome Extensions Coding documentation is not that great.
