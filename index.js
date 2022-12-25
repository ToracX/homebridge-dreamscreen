const colorsys = require('colorsys');
const DreamscreenClient = require("dreamscreen-node").Client;
const client = new DreamscreenClient();
let Service, Characteristic, UUIDGen;

client.init();

module.exports = function(homebridge) {
        Service = homebridge.hap.Service;
        Characteristic = homebridge.hap.Characteristic;
        UUIDGen = homebridge.hap.uuid;
        homebridge.registerAccessory("homebridge-dreamscreen", "Dreamscreen", DreamscreenAccessory);
};

function DreamscreenAccessory(log, config) {
        this.ipadress = config["ipadress"];
        this.name = config["name"]
        this.ambilightService = new Service.Switch("Ambilight mode");
        this.ambilightService.subtype = "Amibilight mode"
        this.lightService = new Service.Lightbulb("Brightness");
        this.lightService.subtype = "Brightness";
        this.infoService = new Service.AccessoryInformation();
        this.log = log;
        this.log(`Initialized ${this.name}`)
}

DreamscreenAccessory.prototype.setcolor = function() {
        client.light(this.ipadress).setMode(3)
        this.ambilightService.getCharacteristic(Characteristic.On).updateValue(0);
        const color = colorsys.hsv_to_rgb({
                h: global.hue,
                s: global.saturation,
                v: global.brightness
        });
        client.light(this.ipadress).setAmbientColor([color.r, color.g, color.b])
        this.log(`Set ${this.name} ambientcolor: ${color.r} ${color.g} ${color.b}`);
}

DreamscreenAccessory.prototype.getcolor = function() {
        ambientcolor = client.light(this.ipadress).getAmbientColor()
        const hsv = colorsys.rgb_to_hsv({
                r: ambientcolor[0],
                g: ambientcolor[1],
                b: ambientcolor[2]
        });
        global.hue = hsv.h
        global.saturation = hsv.s
        this.log(`Getting ${this.name} ambientcolor: ${hsv.h} ${hsv.s} ${hsv.v}`);
}

DreamscreenAccessory.prototype.getServices = function() {
        let services = [];
        this.lightService
        .addCharacteristic(Characteristic.Brightness)
        .on('get', callback => {
                global.brightness = client.light("192.168.178.65").getBrightness()
                this.log(`Getting ${this.name} current brightness: ${global.brightness} `)
                this.lightService.getCharacteristic(Characteristic.Brightness).updateValue(global.brightness);
                callback(null, global.brightness);
        })

        .on('set', (value, callback) => {
                global.brightness = value
                this.log(`Set ${this.name} brightness to: ${global.brightness}`)
                client.light(this.ipadress).setBrightness(global.brightness)
                if (global.brightness == 0) {
                        client.light(this.ipadress).setMode(0) //brightness = 0 so can be turned off dreamscreen anyway
                        this.ambilightService.getCharacteristic(Characteristic.On).updateValue(0);
                } else if (global.saturation && global.hue && global.brightness !== 0) {
                        client.light(this.ipadress).setMode(3) //brightness is > 0 en kleur is niet wit dus ambient mode
                }
                callback();
        })
        
        this.lightService
        .addCharacteristic(Characteristic.Hue)
        .on('get', callback => {
                this.getcolor();
                this.lightService.getCharacteristic(Characteristic.Hue).updateValue(global.hue);
                this.log(`Getting ${this.name} current ambientcolor hue: ${global.hue}`)
                callback(null, global.hue);
        })
        .on('set', (value, callback) => {
                global.hue = value
                this.setcolor(this.ipadress);
                this.log(`Set ${this.name} hue to: ${global.hue}`)
                callback();
        })
        
        this.lightService
        .addCharacteristic(Characteristic.Saturation)
        .on('get', callback => {
                this.getcolor(this.ipadress);
                this.lightService.getCharacteristic(Characteristic.Saturation).updateValue(global.saturation);
                this.log(`Getting ${this.name} current ambientcolor saturation: ${global.saturation}`)
                callback(null, global.saturation);
        })
        .on('set', (value, callback) => {
                global.saturation = value
                this.log(`Set ${this.name} saturation to: ${global.saturation}`)
                this.setcolor(this.ipadress);
                callback();
        })
        
        this.ambilightService
        .getCharacteristic(Characteristic.On)
        .on('get', (callback) => {
                this.mode = client.light(this.ipadress).getMode()

                this.ambilightService
                .getCharacteristic(Characteristic.On)
                .updateValue(this.mode);

                if (this.mode == 1) {
                        this.log(`Getting ${this.name} current mode: video`)
                        callback(null, 1);
                } else if (this.mode !== 1) {
                        this.log(`Getting ${this.name} current mode: ${this.mode}`) //wip
                        callback(null, 0)
                }
        })
        
        .on('set', (value, callback) => {
                this.mode = Number(value)
                client.light(this.ipadress).setMode(this.mode)
                if (this.mode == 1) {
                        this.log(`Set ${this.name} mode to video mode`)
                        this.lightService.getCharacteristic(Characteristic.Hue).updateValue(0);
                        this.lightService.getCharacteristic(Characteristic.Saturation).updateValue(0);
                } else {
                        this.log(`Set ${this.name} mode to sleep mode`)
                }
                callback();
        })

        services.push(this.lightService);
        services.push(this.ambilightService);
        services.push(this.infoService);
        
        this.infoService
        .setCharacteristic(Characteristic.Manufacturer, "DreamScreen")
        .setCharacteristic(Characteristic.Model, "DreamScreen 4K")
        .setCharacteristic(Characteristic.SerialNumber, this.ipadress)
        .setCharacteristic(Characteristic.FirmwareRevision, "1.6.17");

        return services;
};
