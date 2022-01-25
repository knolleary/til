# Remote Control Elgato Key Lights

The Elgato Key Lights listen on port 9123 and you can `put` requests to `/elgato/lights`
to control them.

In the following commands, make sure to substitute the IP address of your lights.

## Turn Lights On

```
curl --location --request PUT 'http://192.168.1.197:9123/elgato/lights'\
  --header 'Content-Type: application/json' \
  --data-raw '{"lights":[{"brightness":40,"temperature":162,"on":1}],"numberOfLights":1}'
```

## Turn Lights Off

```
curl --location --request PUT 'http://192.168.1.197:9123/elgato/lights'\
  --header 'Content-Type: application/json' \
  --data-raw '{"lights":[{"on":0}],"numberOfLights":1}'
```
