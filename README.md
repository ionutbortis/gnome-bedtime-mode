# Gnome Bedtime

Hey Gnome, it's bedtime! 

Converts to grayscale the entire Gnome workspace by using a smooth transition. 

This behaviour is similar to Android's bedtime mode which converts the phone screen to grayscale. It should somewhat make your device less appealing and limit the usage of it before bedtime. On my side, at least, it still requires a fair amount of self control in order to make that happen. 

# Installation

From the Gnome extensions website, by using this link:
https://extensions.gnome.org/extension/4012/gnome-bedtime/

Or

Using a terminal, you can do the following sequence of commands:

```
$ git clone https://github.com/ionutbortis/gnome-bedtime.git
$ mv gnome-bedtime ~/.local/share/gnome-shell/extensions/gnomebedtime@ionutbortis.gmail.com
```

Then press `Alt`+`F2`, type `r` in the dialog window, then press `Enter`.

You can now enable the extension by running `gnome-shell-extension-prefs`, or by
browsing to https://extensions.gnome.org/local.

Alternatively, you can enable/disable the extension from command line:
```
gnome-extensions enable gnomebedtime@ionutbortis.gmail.com
gnome-extensions disable gnomebedtime@ionutbortis.gmail.com
```

Credits for inspiration go to:
- Desaturate All extension: https://extensions.gnome.org/extension/1102/desaturate-all/ (https://github.com/laerne/desaturate_all)
- Tint All extension: https://extensions.gnome.org/extension/1471/tint-all/ (https://github.com/amarovita/tint-all)

I wrote this extension because I want to be able to switch it on and off from command line. Also, I added a smooth transition from normal to grayscale and back.

Because it can be enabled/disabled from command line, you can schedule it nicely with crontab, your own scripts or some other extensions that support scheduling.

Night Theme Switcher extension (https://extensions.gnome.org/extension/2236/night-theme-switcher/) has a Manual Schedule section and you can set two commands for sunrise and sunset. Also, that extension offers the possibility to follow the Night Light settings and some other nice goodies.

I might add some features in the future, don't be shy to drop some improvement ideas. 

One thing I don't actually like is that the grayscale screen gets disabled when the user is locked out, the computer is suspended, etc., but this seems to be a requirement of the Gnome shell integration. Maybe I should create some configuration for the extension in order to override this, hmmm...
