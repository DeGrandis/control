#include <WiFi.h>
#include <PubSubClient.h>

#define ssid "Airwave-03-103B"
#define password ""

#define mqttBroker "172.16.120.194"
#define subTopic "apartment/shower"
#define subTopic2 "apartment/bathroomLight"
#define pubTopic ""

WiFiClient wifiClient;
PubSubClient client(wifiClient);

static int relays[] = {13, 4, 2, 3};

static int servoPin = 5;

void relayOn(int pin) {
  digitalWrite(relays[pin], HIGH);
}

void relayOff(int pin) {
  digitalWrite(relays[pin], LOW);
}


/**
 * Connects to WiFi and prints out local IP + MAC address
 */
void connectWifi() 
{
  delay(200);
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);

  while(WiFi.status() != WL_CONNECTED) {
    delay(150);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi: Connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("MAC address: ");
  Serial.println(WiFi.macAddress());
}

/*
 * Callback function that gets called when subscribed topic gets
 * a message published to it.
 * 
 * @topic the topic that published the message
 * @payload the message
 * @length the length of the message
 */
void callback(char* topic, byte* payload, unsigned int length) 
{

  String callTopic = "";
  int i = 0;
  while((char)topic[i] != 0) {
    callTopic += (char)topic[i];
    i++;
  }

  if (callTopic.equals(subTopic)) {
    if((char)payload[0] == '0') {
      relayOff(0);
    } else if ((char)payload[0] == '1'){
      relayOn(0);
    }    
  }

  if (callTopic.equals(subTopic2)) {
    if((char)payload[0] == '0') {
      off();
      Serial.println("Off function Called.");
    } else if ((char)payload[0] == '1'){
      Serial.println("On function Called.");
      on();
    }    
  }
}

void on() {
  ledcAttachPin(servoPin, 5);
  ledcWrite(servoPin, 4000);
  delay(500);
  ledcDetachPin(servoPin);
  
  
  
}

void off() {
   ledcAttachPin(servoPin, 5);
  ledcWrite(servoPin, 7000);
  delay(500);
  ledcDetachPin(servoPin);
}

/*
 * First function to run.
 */
void setup() 
{
  Serial.begin(115200);
  connectWifi();
  delay(1000);
  client.setServer(mqttBroker, 1883);
  client.setCallback(callback);
  
  if(client.connected()) {
    Serial.println("MQTT: Connected");
  }

  pinMode(relays[0], OUTPUT); 
  pinMode(relays[1], OUTPUT); 
  digitalWrite(relays[0], LOW);
  digitalWrite(relays[1], LOW);
  
  pinMode(servoPin, OUTPUT); 
  ledcSetup(servoPin, 50, 16);
}

void reconnect() 
{
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32")) {
      Serial.println("connected");
      client.subscribe(subTopic);
      client.subscribe(subTopic2);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(", resetting wif connection.");
      // Wait 5 seconds before retrying

      WiFi.disconnect();
      Serial.println("Disconnected from WiFi");

      connectWifi();
      Serial.println("Wifi Reconnected!  Trying MQTT Connection again.");
      delay(5000);
    }
  }
}


void loop() 
{
  if(!client.connected()) {
    reconnect();
  }
  client.loop();
}
