var fs = require('fs'),
    included_files_ = {};

global.include = function(fileName) {
    // console.log('Loading file: ' + fileName);
    var ev = require(fileName);
    for (var prop in ev) {
        // console.log('Loading prop:' + prop);
        global[prop] = ev[prop];
    }
    included_files_[fileName] = true;
};

global.include_once = function(fileName) {
    if (!included_files_[fileName]) {
        include(fileName);
    }
};

global.include_folder_once = function(folder) {
    var file, fileName,
        files = fs.readdirSync(folder);

    var getFileName = function(str) {
        var splited = str.split('.');
        splited.pop();
        return splited.join('.');
    },

    getExtension = function(str) {
        var splited = str.split('.');
        return splited[splited.length - 1];
    };

    for (var i = 0; i < files.length; i++) {
        file = files[i];
        if (getExtension(file) === 'js') {
            fileName = getFileName(file);
            try {
                include_once(folder + '/' + file);
            } catch (err) {
                console.log(err);
            }
        }
    }
};


// ==== Global JS variables
var Base64Binary = [1, 99, 50, 128, 60, 140, 92, 156, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


// ==== MAIN JS code
var packet = {};
function parser_data(port) {
	if(port == 2)
    	switch(Base64Binary[0]){
    		case 1://????? ? ???????? ???????????
    		
    		parser_packet_one();
    		return packet;
    		break;

    		case 2://????? ?????????
    		parser_packet_two();
    		return packet;
    		break;

    		case 4://????? ? ??????????? ? ??????? ???????
    		parser_packet_four();
    		return packet;
	    	break;

	    	case 5://????? ? ??????????? ?? ????????? ????????? ??????
	    	parser_packet_five();
    		return packet;
	    	break;
    	}
    else if (port == 4)
    	switch(Base64Binary[0]){
    		case 255:
    		parser_packet_255();
    		return packet;
    		break;
    	}
    else if (port == 3)
    	switch(Base64Binary[0]){
    		case 0:
    		parser_packet_zero();
    		return packet;
    		break;
    	}	
}

function parser_packet_one(){
	packet['type_packet']=Base64Binary[0];
	parser_charge_and_options();

	packet['utc_time'] = new Date(parser_time(3)*1000);

	packet['temp'] = parser_temp(7);

	parser_indication(8);
}

function parser_packet_two(){
	packet['type_packet']=Base64Binary[0];
	parser_charge_and_options();
	packet['id_input_alarm'] = Base64Binary[3];

	packet['utc_time'] = new Date(parser_time(4)*1000);

	parser_indication(8);

}



function parser_packet_four(){
	packet['type_packet']=Base64Binary[0];
	parser_charge_and_options();

	packet['nutritional_status'] = Base64Binary[3];
	
	packet['generation_utc_time'] = new Date(parser_time(4)*1000);

}


function parser_packet_five(){
	packet['type_packet']=Base64Binary[0];
	parser_charge_and_options();

	packet['output_number'] = Base64Binary[3];
	
	packet['output_status'] = Base64Binary[4];
	
	packet['generation_utc_time'] = new Date(parser_time(5)*1000);

}


function parser_packet_255(){
	packet['type_packet']=Base64Binary[0];
	packet['generation_utc_time'] = new Date(parser_time(1)*1000);
}
function parser_packet_zero(){
	packet['type_packet']=Base64Binary[0];
	packet['array_params']=[]
	for (var i = 1; i < Base64Binary.length; i=i+3+Base64Binary[i+2]) {
		param_hash = {
			id_param: BytesToInt32([Base64Binary[i],Base64Binary[i+1]]),
			data_len: Base64Binary[i+2],
			data_value: parser_param(i+3,Base64Binary[i+2])
		}
		packet['array_params'].push(param_hash);
	}
}


function parser_temp(index)
{
	return Int8(Base64Binary[index])
}

function parser_charge_and_options(){
	packet['battery_charge'] = Base64Binary[1];
	packet['option_values'] = {};

	let bit_list = ByteToBitList(Base64Binary[2]);
	bit_list.reverse();
	let period_output = [bit_list[1],bit_list[2],bit_list[3]].reverse();
	packet['option_values']['type_activation'] = bit_list[0];


	
	let s = period_output.join(',');
	switch(s){
		case "0,0,0":
		packet['option_values']['period_output'] = "5m";
		break;
		case "0,0,1":
		packet['option_values']['period_output'] = "15m";
		break;
		case "0,1,0":
		packet['option_values']['period_output'] = "30m";
		break;
		case "0,1,1":
		packet['option_values']['period_output'] = "1h";
		break;
		case "1,0,0":
		packet['option_values']['period_output'] = "6h";
		break;
		case "1,0,1":
		packet['option_values']['period_output'] = "12h";
		break;
		case "1,1,0":
		packet['option_values']['period_output'] = "24h";
		break;
	}


	packet['option_values']['type_first_input'] = bit_list[4];
	packet['option_values']['type_second_input'] = bit_list[5];
	packet['option_values']['type_third_input'] = bit_list[6];
	packet['option_values']['type_fourth_input'] = bit_list[7];
}

function parser_indication(index){
	packet['indication_1'] = BytesToInt32([Base64Binary[index],Base64Binary[index+1],Base64Binary[index+2],Base64Binary[index+3]]);
	packet['indication_2'] = BytesToInt32([Base64Binary[index+4],Base64Binary[index+5],Base64Binary[index+6],Base64Binary[index+7]]);
	packet['indication_3'] = BytesToInt32([Base64Binary[index+8],Base64Binary[index+9],Base64Binary[index+10],Base64Binary[index+11]]);
	packet['indication_4'] = BytesToInt32([Base64Binary[index+12],Base64Binary[index+13],Base64Binary[index+14],Base64Binary[index+15]]);
}

function parser_param(index,len){
	list = [];
	for (var k = 0; k<len; k++) {
		list.push(Base64Binary[index+k]);
	}
	return BytesToInt32(list);
}

function parser_time(index){
	let utc_int = BytesToInt32([Base64Binary[index],Base64Binary[index+1],Base64Binary[index+2],Base64Binary[index+3]]);
	return utc_int;
}

function ByteToBitList(byte){
    var list = [];
    for (var i = 7; i >= 0; i--) {
    	if ((byte >> i) & 1){
    		list.push(1);
    	}
    	else list.push(0);
    }
    return list;
}


function BytesToInt32(list){
	let sum = 0;
	for(var i in list){
		sum += list[i] << 8*i;
	}
    return sum;
}


var UInt4 = function (value) {
	return (value & 0xF);
};

var Int4 = function (value) {
	var ref = UInt4(value);
	return (ref > 0x7) ? ref - 0x10 : ref;
};

var UInt8 = function (value) {
	return (value & 0xFF);
};

var Int8 = function (value) {
	var ref = UInt8(value);
	return (ref > 0x7F) ? ref - 0x100 : ref;
};

var UInt16 = function (value) {
	return (value & 0xFFFF);
};

var Int16 = function (value) {
	var ref = UInt16(value);
	return (ref > 0x7FFF) ? ref - 0x10000 : ref;
};


var UInt32 = function (value) {
	return (value & 0xFFFFFF);
};

var Int32 = function (value) {
	var ref = UInt32(value);
	return (ref > 0x7FFFFF) ? ref - 0x1000000 : ref;
};

var UInt64 = function (value) {
	return (value & 0xFFFFFFFF);
};

var Int64 = function (value) {
	var ref = UInt64(value);
	return (ref > 0x7FFFFFFF) ? ref - 0x100000000 : ref;
};
    
var __func_call_res = parser_data(2);
process.stdout.write(JSON.stringify(__func_call_res));
