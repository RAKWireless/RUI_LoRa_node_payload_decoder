// ttn application function to decode uplink data.
// Decode decodes an array of bytes into an object.
//  - port contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object
// for RAK, return {
//                     "DecodeDataHex": {} // RAK5205 sensor data in Hex format
//                     "DecodeDataObj": {} // RAK5205 sensor data object.
//                 }
// The function prototype cannot be modified.
function Decoder(bytes, port) {
  var decoded = {"DecodeDataHex": {}, "DecodeDataObj": {}};
  var hexString=bin2HexStr(bytes);
  decoded.DecodeDataHex = hexString;
  decoded.DecodeDataObj = rakSensorDataDecode(hexString);

  return decoded;
}

// convert array of bytes to hex string.
// e.g: 0188053797109D5900DC140802017A0768580673256D0267011D040214AF0371FFFFFFDDFC2E
function bin2HexStr(bytesArr) {
  var str = "";
  for(var i=0; i<bytesArr.length; i++) {
    var tmp = bytesArr[i].toString(16);
    if(tmp.length == 1) {
      tmp = "0" + tmp;
    }
    str += tmp;
  }
  return str;
}

// convert string to short integer
function parseShort(str, base) {
  var n = parseInt(str, base);
  return (n << 16) >> 16;
}

// decode Hex sensor string data to object
function rakSensorDataDecode(hexStr) {
  var str = hexStr;
  var myObj = {};
  var environment = {};

  while (str.length > 4) {
    var flag = parseInt(str.substring(0, 4), 16);
    switch (flag) {
      case 0x0768:// Humidity
        environment.humidity = ((parseShort(str.substring(4, 6), 16) * 0.01 / 2) * 100).toFixed(1) + '% RH';
        str = str.substring(6);
        break;
      case 0x0673:// Atmospheric pressure
        environment.barometer = (parseShort(str.substring(4, 8), 16) * 0.1).toFixed(2) + "hPa";
        str = str.substring(8);
        break;
      case 0x0267:// Temperature
        environment.temperature = (parseShort(str.substring(4, 8), 16) * 0.1).toFixed(2) + "°C";
        str = str.substring(8);
        break;
      case 0x0188:// GPS
        var gps = {};
        gps.latitude = (parseInt(str.substring(4, 10), 16) * 0.0001).toFixed(4) + "°";
        gps.longitude = (parseInt(str.substring(10, 16), 16) * 0.0001).toFixed(4) + "°";
        gps.altitude = (parseInt(str.substring(16, 22), 16) * 0.01).toFixed(1) + "m";
        myObj.gps = gps;
        str = str.substring(22);
        break;
      case 0x0371:// Triaxial acceleration
        var acceleration = {};
        acceleration.x = (parseShort(str.substring(4, 8), 16) * 0.001).toFixed(3) + "g";
        acceleration.y = (parseShort(str.substring(8, 12), 16) * 0.001).toFixed(3) + "g";
        acceleration.z = (parseShort(str.substring(12, 16), 16) * 0.001).toFixed(3) + "g";
        myObj.acceleration = acceleration;
        str = str.substring(16);
        break;
      case 0x0402:// air resistance
        environment.gasResistance = (parseShort(str.substring(4, 8), 16) * 0.01).toFixed(2)  + "KΩ";
        str = str.substring(8);
        break;
      case 0x0802:// Battery Voltage
        myObj.battery = (parseShort(str.substring(4, 8), 16) * 0.01).toFixed(2) + "V";
        str = str.substring(8);
        break;
      case 0x0586:// gyroscope
        var gyroscope = {};
        gyroscope.x = (parseShort(str.substring(4, 8), 16) * 0.01).toFixed(2) + "°/s";
        gyroscope.y = (parseShort(str.substring(8, 12), 16) * 0.01).toFixed(2) + "°/s";
        gyroscope.z = (parseShort(str.substring(12, 16), 16) * 0.01).toFixed(2) + "°/s";
        myObj.gyroscope = gyroscope;
        str = str.substring(16);
        break;
      case 0x0902:// magnetometer x
        var magnetometer = {};
        magnetometer.x = (parseShort(str.substring(4, 8), 16) * 0.01).toFixed(2) + "μT";
        magnetometer.y = (parseShort(str.substring(12, 16), 16) * 0.01).toFixed(2) + "μT";
        magnetometer.z = (parseShort(str.substring(20, 24), 16) * 0.01).toFixed(2) + "μT";
        myObj.magnetometer = magnetometer;
        str = str.substring(24);
        break;
      default:
        str = str.substring(7);
        break;
    }
  }
  if(Object.getOwnPropertyNames(environment).length > 0) {
    myObj.environment = environment;
  }

  return myObj;
}
