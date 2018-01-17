# ctrl.
ctrl. (pronounced "control") is my custom home automation solution.  It can do timed actions and make generative toggle pages.  As of now, the plan is to run it on a raspberry pi (broker) and use ESP32 and ESP8266 (sub-clients) modules for physical interfacing.  The website portion is designed to be added to the homescreen of either an Android or iOS device.  This is out of laziness, I'm not coding two seperate apps for this.


#What is needed:
##Physical
*Raspberry Pi (or some other local dedicated server)
*ESP Modules (32, 8266, or some future type)
*Relays
*(optional) Pipe Solenoid
##Software
*NodeJS
*Mosquito (MQTT Server)
*Arduino IDE (With ESP firmware installed)
