exports.room = function(message){
	switch(true){
		case /living room/i.test(message):
			message = "living room";
			break;
		case /bedroom/i.test(message):
			message = "bedroom";
			break;
		case /office/i.test(message):
			message = "office"
			break;
		case /dining room/i.test(message):
			message = "dining room";
			break;
		case /outdoor/i.test(message):
			message = "outdoor";
			break;
		default:
			message = "N/A";
			break;
	}
	return message;
}

exports.budget = function(message){
	var num_array = message.match(/\d+/g);
	if (num_array){
		var price = num_array[0];
		switch (true){
			case (price <= 500):
				message = "$500 and under";
				break;
			case (price > 500 && price <= 1000):
				message = "$500 - $1000";
				break;
			case (price > 1000 && price <= 3000):
				message = "$1000 - $3000";
				break;
			case (price > 3000 && price <= 5000):
				message = "$3000 - $5000";
				break;
			case (price > 5000):
				message = "over $5000";
				break;
		}
	} else {
		message = "N/A";
	}
	return message;
}

exports.timeline = function(message){
	var num_array = message.match(/\d+/g);
	if (num_array && /week/i.test(message)){
		var price = num_array[0];
		switch (true) {
			case (price < 2):
				message = "0-1 week";
				break;
			case (price < 3):
				message = "1-2 weeks";
				break;
			case (price < 5):
				message = "3-4 weeks";
				break;
			default:
				message = "1 month or no timeline";
				break;
		}
	} else {
		message = "1 month or no timeline";
	}
	return message;
}

exports.style = function(message){
	switch(true){
		case /modern/i.test(message):
			message = "Modern";
			break;
		case /traditional/i.test(message):
			message = "Traditional";
			break;
		case /industrial/i.test(message):
			message = "Industrial";
			break;
		case /eclectic/i.test(message):
			message = "Eclectic";
			break;
		case /contemporary/i.test(message):
			message = "Contemporary";
			break;
		default:
			message = "N/A";
	}
	return message;
}