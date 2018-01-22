# ctrl.
ctrl. (pronounced "control") is my custom home automation solution.  It can do timed actions and make generative toggle pages.  As of now, the plan is to run it on a raspberry pi (broker) and use ESP32 and ESP8266 (sub-clients) modules for physical interfacing.  The website portion is designed to be added to the homescreen of either an Android or iOS device.  This is out of laziness, I'm not coding two separate apps for this.


The goal is to recreate a scalable system for IOT devices to easily be interfaced.  In ctrl, **anything** that can subscribe and publish MQTT topics can be connected to this system.


## What is needed:
### Physical
*   Raspberry Pi (or some other local dedicated server)
*   ESP Modules (32, 8266, or some future type)
*   Relays
*   (optional) Pipe Solenoid
*   RF transmitter/receiver
*   Remote Outlets (cheap ones will work)
### Software
*   [NodeJS](https://nodejs.org/en/)
*   [Mosquito](https://mosquitto.org/) (MQTT Server)
*   [MongoDB](https://www.mongodb.com/) (I am using [MLab](https://mlab.com/) for mine)
*   [Arduino IDE](https://www.arduino.cc/en/Main/Software) (With ESP firmware installed)
