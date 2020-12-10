/**
 * 将设备自定义topic数据转换为json格式数据, 设备上报数据到物联网平台时调用
 * 入参：topic   字符串，设备上报消息的topic     
 * 入参：rawData byte[]数组                  不能为空
 * 出参：jsonObj JSON对象                    不能为空
 */
function transformPayload(topic, rawData) {
    var jsonObj = {}
    return jsonObj;
}

/**
 * 将设备的自定义格式数据转换为Alink协议的数据，设备上报数据到物联网平台时调用
 * 入参：rawData byte[]数组     不能为空
 * 出参：jsonObj Alink JSON对象 不能为空
 */
function rawDataToProtocol(rawData) {
    var jsonObj = {}
    jsonObj['method'] = 'thing.event.property.post'; //ALink JSON格式 - 属性上报topic
    jsonObj['version'] = '1.0'; //ALink JSON格式 - 协议版本号固定字段
    jsonObj['id'] = '' + 12345; //ALink JSON格式 - 标示该次请求id值
	var hexString=bin2HexStr(rawData);
	jsonObj.params = rakSensorDataDecode(hexString);

    return jsonObj;
}

// convert array of bytes to hex string.
// e.g: 0188053797109D5900DC140802017A0768580673256D0267011D040214AF0371FFFFFFDDFC2E
function bin2HexStr(bytesArr) {
  var str = "";
  for(var i=0; i<bytesArr.length; i++) {
    var tmp = (bytesArr[i] & 0xff).toString(16);
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

// convert string to triple bytes integer
function parseTriple(str, base) {
  var n = parseInt(str, base);
  return (n << 8) >> 8;
}

// decode Hex sensor string data to object
function rakSensorDataDecode(hexStr) {
  var str = hexStr;
  var myObj = {};

  while (str.length > 4) {
    var flag = parseInt(str.substring(0, 4), 16);
    switch (flag) {
      case 0x0768:// Humidity
        myObj.Humidity = ((parseShort(str.substring(4, 6), 16) / 100 / 2) * 100);
        str = str.substring(6);
        break;
      case 0x0673:// Atmospheric pressure
        myObj.Atmosphere = (parseShort(str.substring(4, 8), 16) / 10);
        str = str.substring(8);
        break;
      case 0x0267:// Temperature
        myObj.Temperature = (parseShort(str.substring(4, 8), 16) / 10);
        str = str.substring(8);
        break;
      case 0x0188:// GPS
        myObj.Latitude = (parseTriple(str.substring(4, 10), 16) / 10000);
        myObj.Longitude = (parseTriple(str.substring(10, 16), 16) / 10000);
        myObj.Altitude = (parseTriple(str.substring(16, 22), 16) / 100);
		var GeoLocation = {};
        GeoLocation.Latitude = myObj.Latitude;
        GeoLocation.Longitude = myObj.Longitude;
        GeoLocation.Altitude = myObj.Altitude;
		myObj.GeoLocation = GeoLocation;
        str = str.substring(22);
        break;
      case 0x0371:// Triaxial acceleration
        myObj.Acceleration_X = (parseShort(str.substring(4, 8), 16) / 1000);
        myObj.Acceleration_Y = (parseShort(str.substring(8, 12), 16) / 1000);
        myObj.Acceleration_Z = (parseShort(str.substring(12, 16), 16) / 1000);
        str = str.substring(16);
        break;
      case 0x0402:// air resistance
        myObj.Gas_resistance = parseShort(str.substring(4, 8), 16) * 10;
        str = str.substring(8);
        break;
      case 0x0802:// Battery Voltage
        myObj.Battery_voltage = (parseShort(str.substring(4, 8), 16) / 100);
        str = str.substring(8);
        break;
      case 0x0586:// gyroscope
        myObj.Gyroscope_X = (parseShort(str.substring(4, 8), 16) / 100);
        myObj.Gyroscope_Y = (parseShort(str.substring(8, 12), 16) / 100);
        myObj.Gyroscope_Z = (parseShort(str.substring(12, 16), 16) / 100);
        str = str.substring(16);
        break;
      case 0x0902:// magnetometer x
        myObj.Magnetometer_X = (parseShort(str.substring(4, 8), 16) / 100);
        str = str.substring(8);
        break;
      case 0x0a02:// magnetometer y
        myObj.Magnetometer_Y = (parseShort(str.substring(4, 8), 16) / 100);
        str = str.substring(8);
        break;
      case 0x0b02:// magnetometer z
        myObj.Magnetometer_Z = (parseShort(str.substring(4, 8), 16) / 100);
        str = str.substring(8);
        break;
      default:
        str = str.substring(7);
        break;
    }
  }

  return myObj;
}

/**
 *  将Alink协议的数据转换为设备能识别的格式数据，物联网平台给设备下发数据时调用
 *  入参：jsonObj Alink JSON对象  不能为空
 *  出参：rawData byte[]数组      不能为空
 *
 */
function protocolToRawData(jsonObj) {
    var rawdata = [];
    return rawdata;
}
