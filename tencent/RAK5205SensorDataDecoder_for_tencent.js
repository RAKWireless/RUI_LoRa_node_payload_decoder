function RawToProtocol(fPort, bytes) {
	var hexString=bin2HexStr(bytes);
	return rakSensorDataDecode(hexString);
}

// convert array of bytes to hex string.
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

// convert string to Triple integer
function parseTriple(str, base) {
	var n = parseInt(str, base);
	return (n << 8) >> 8;
}

// decode Hex sensor string data to object
function rakSensorDataDecode(hexStr) {
	var str = hexStr;

	var data = {
		"method": "report",
		"clientToken" : new Date(),
		"params" : {}
	};

	while (str.length > 4) {
		var flag = parseInt(str.substring(0, 4), 16);
		switch (flag) {
			case 0x0768:// Humidity
				data.params.relative_humidity= ((parseShort(str.substring(4, 6), 16) * 0.01 / 2) * 100).toFixed(1);
				str = str.substring(6);
				break;
			case 0x0673:// Atmospheric pressure
				data.params.barometric_pressure= (parseShort(str.substring(4, 8), 16) * 0.1).toFixed(2);
				str = str.substring(8);
				break;
			case 0x0267:// Temperature
				data.params.temperature = (parseShort(str.substring(4, 8), 16) * 0.1).toFixed(2);
				str = str.substring(8);
				break;
			case 0x0188:// GPS
				data.params.gps_latitude = (parseTriple(str.substring(4, 10), 16) * 0.0001).toFixed(4);
				data.params.gps_longitude = (parseTriple(str.substring(10, 16), 16) * 0.0001).toFixed(4);
				data.params.gps_altitude = (parseTriple(str.substring(16, 22), 16) * 0.01).toFixed(1);
				str = str.substring(22);
				break;
			case 0x0371:// Triaxial acceleration
				data.params.trixial_x= (parseShort(str.substring(4, 8), 16) * 0.001).toFixed(3);
				data.params.trixial_y= (parseShort(str.substring(8, 12), 16) * 0.001).toFixed(3);
				data.params.trixial_z= (parseShort(str.substring(12, 16), 16) * 0.001).toFixed(3);
				str = str.substring(16);
				break;
			case 0x0402:// air resistance
				data.params.gas_resistance= (parseShort(str.substring(4, 8), 16) * 0.01).toFixed(2);
				str = str.substring(8);
				break;
			case 0x0802:// Battery Voltage
				data.params.battery_voltage = (parseShort(str.substring(4, 8), 16) * 0.01).toFixed(2);
				str = str.substring(8);
				break;
			case 0x0586:// gyroscope
				data.params.gyroscope_x = (parseShort(str.substring(4, 8), 16) * 0.01).toFixed(2);
				data.params.gyroscope_y = (parseShort(str.substring(8, 12), 16) * 0.01).toFixed(2);
				data.params.gyroscope_z = (parseShort(str.substring(12, 16), 16) * 0.01).toFixed(2);
				str = str.substring(16);
				break;
			case 0x0902:// magnetometer x
				data.params.magnetometer_x = (parseShort(str.substring(4, 8), 16) / 100);
				str = str.substring(8);
				break;
			case 0x0a02:// magnetometer y
				data.params.magnetometer_y = (parseShort(str.substring(4, 8), 16) / 100);
				str = str.substring(8);
				break;
			case 0x0b02:// magnetometer z
				data.params.magnetometer_z = (parseShort(str.substring(4, 8), 16) / 100);
				str = str.substring(8);
				break
			default:
				str = str.substring(7);
				break;
		}
	}

	return data;
}