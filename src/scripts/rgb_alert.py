import RPi.GPIO as  GPIO
import importlib
import time
import sys
import paho.mqtt.client as mqtt

# BOARD pin numbering
LedR	=	12
LedG	=	13
LedB	=	15

#ds18b20 = '28-031467805fff'
#location = '/sys/bus/w1/devices/' + ds18b20 + '/w1_slave'

rgb			=	importlib.import_module('rgb_led')

rgb.setup(LedR, LedG, LedB)

broker="broker.mqttdashboard.com"

# MQTT Client Setup inspired by http://www.steves-internet-guide.com/into-mqtt-python-client/
client = mqtt.Client("client_equipe09")

def setup():
	client.on_connect = on_connect
	client.on_log = on_log
	client.on_message = on_message

	client.connect(broker)
	client.loop_start()
	client.subscribe("/gti780a2021alerts/equipe09/alert")

def on_connect(client, userdata, flags, rc):
	if rc==0:
		print ('Connected to the MQTT client')
	else:
		print ('Error while connecting to the MQTT client')

def on_message(client, userdata, msg):
	message = str(msg.payload.decode("utf-8"))
	rgbSplit = message.split(';')
	# Conversion taken from https://stackoverflow.com/questions/3380726/converting-a-rgb-color-tuple-to-a-six-digit-code
	color = '0x%02x%02x%02x' % (int(rgbSplit[0]), int(rgbSplit[1]), int(rgbSplit[2]))
	print (int(color, 16))
	rgb.setColor(int(color, 16))

def on_log(client, userdata, level, buf):
	print ('Log: ',buf)

def loop():
	while True:
		continue

def destroy():
	rgb.destroy()
	client.loop_stop()
	client.disconnect()
	GPIO.cleanup()

if __name__ == "__main__":
	try:
		setup()
		loop()
	except KeyboardInterrupt:
		destroy()
