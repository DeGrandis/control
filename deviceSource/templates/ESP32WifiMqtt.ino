#include <WiFi.h>
#include <PubSubClient.h>

#define ssid "Airwave-03-103B"
#define password ""

#define mqttBroker "172.16.120.194"
#define subTopic "apartment/test"
#define pubTopic ""

WiFiClient wifiClient;
PubSubClient client(wifiClient);

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

  for(int i = 0; i < length; i++ ) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  
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


}

void reconnect() 
{
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP32")) {
      Serial.println("connected");
      client.subscribe(subTopic);
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
