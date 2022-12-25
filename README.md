![DreamscreenLogoCut](https://user-images.githubusercontent.com/37554472/209482560-84508a92-e7e4-4602-975a-4d6fbaf74d19.png)

# Overview
A lightweight HomeBridge plugin to control any DreamScreen product including sidekicks. Using a fast and responsive node engine that I have customized to also retrieve state. 

## Installation:
Easiest way to install is using [homebridge-config-ui]([https://www.google.com](https://github.com/oznu/homebridge-config-ui-x)). Search for the plugin, click install and follow the steps on your screen. 
Or install using npm ```npm install -g homebridge-dreamscreen``` and update your config.json.

## Config Example only needed when not using homebridge-config-ui
```json
{
    "accessory": "Dreamscreen",
    "name": "Dreamscreen ambilight",
    "ipadress": "192.xxx.xxx.xxx"          
}
```

## Using the plugin
You get two accesoires packed in one tile. One accesoiry is for controlling the brightness and color. The other for setting either video mode or sleep mode.

## Todo list
* Add options for hdmi input, maybe using a TV accesoiry?..
* Add switches for different scenes
