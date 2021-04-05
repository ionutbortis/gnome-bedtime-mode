

# Gnome Bedtime  ![](./extras/images/gnome-bedtime-icon.svg)

Hey Gnome, it's bedtime! 

Converts to grayscale the entire Gnome workspace by using a smooth transition. Best to use during evening/night.

This behaviour is similar to Android's bedtime mode which converts the phone screen to grayscale. It should somewhat make your device less appealing and limit the usage of it before bedtime. On my side, at least, it still requires a fair amount of self control in order to make that happen. 

The extension has a nice Preferences (Settings) UI where you can customize it to your liking. You can set an automatic schedule for turning on/off the Bedtime Mode, add an On Demand button to Top Bar or System Menu, etc. Just give it a try! :sunglasses:

![](./extras/images/screenshot.png)

# Installation

From the official Gnome extensions website, by using this link:
[Gnome Bedtime Page](https://extensions.gnome.org/extension/4012/gnome-bedtime/)

Or

Using a terminal, you can do the following sequence of commands:

```
git clone https://github.com/ionutbortis/gnome-bedtime.git

extension_home=~/.local/share/gnome-shell/extensions/gnomebedtime@ionutbortis.gmail.com

rm -rf $extension_home && mv gnome-bedtime/* $extension_home
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
* Go to Settings -> Keyboard Shortcuts
* Scroll to the end and press the "+" button
* Fill the inputs with the following
  * Name: Toggle Bedtime Mode
  * Command:
```
bash -c 'schemadir=~/.local/share/gnome-shell/extensions/gnomebedtime@ionutbortis.gmail.com/schemas/; if [[ $(gsettings --schemadir $schemadir get org.gnome.shell.extensions.gnomebedtime bedtime-mode-active) == "true" ]]; then gsettings --schemadir $schemadir set org.gnome.shell.extensions.gnomebedtime bedtime-mode-active false; else gsettings --schemadir $schemadir set org.gnome.shell.extensions.gnomebedtime bedtime-mode-active true; fi'
```
  * Press Set Shortcut and use your preffered one
  * Done!


# Credits 

Credits for inspiration go to:
* [Desaturate All](https://extensions.gnome.org/extension/1102/desaturate-all/) extension | [Github URL](https://github.com/laerne/desaturate_all)
* [Tint All](https://extensions.gnome.org/extension/1471/tint-all/) extension | [Github URL](https://github.com/amarovita/tint-all)
* [Night Theme Switcher](https://extensions.gnome.org/extension/2236/night-theme-switcher/) extension | [Gitlab URL](https://gitlab.com/rmnvgr/nightthemeswitcher-gnome-shell-extension/)

I wrote this extension because I like and use daily the Android's Bedtime Mode and I wanted something similar for my laptop. I'm a new linux user (using only Ubuntu now on my daily driver laptop) and I liked the idea of extending the desktop to your linking. It was also a good way to improve on my JavaScript coding skills.

Many thanks to the creator of the [Night Theme Switcher](https://gitlab.com/rmnvgr/nightthemeswitcher-gnome-shell-extension/) extension. I used his code for reference since the Gnome Extensions Coding documentation is not that great.

