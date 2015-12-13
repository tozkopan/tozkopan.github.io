jQuery.sap.declare("mvideo.cafe.util.Formatter");

mvideo.cafe.util.Formatter = {
	aMonth : [ "января", "февраля", "марта", "апреля", "мая", "июня", "июля",
			"августа", "сентября", "октября", "ноября", "декабря" ],

	getGroupHeader : function(code) {
		var aGroups = sap.ui.getCore().myApp.getModel().getProperty("/groups");
		if (aGroups && aGroups.length > 0) {
			return aGroups.filter(function(item) {
				return (item.id == code);
			})[0].name;
		}
	},
	showAddInfo : function(code) {
		return code === "enslife";
	},
	getBlahBlah : function(length) {
		var text = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor"
				+ " incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nost"
				+ "rud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis a"
				+ "ute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat"
				+ " nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa q"
				+ "ui officia deserunt mollit anim id est laborum.";
		return text.substring(0, length);
	},
	costSpell : function(input) {
		if (input) {
			return input + ' рублей';
		}
	},
	tileType : function(input) {
		return (input) ? "None" : "Create";
	},
	tileInfoState : function(input) {
		switch (input) {
		case 1:
			return "None";
		case 2:
			return "Warning";
		case 3:
			return "Success";
		case 4:
			return "Error";
		case 5:
			return "Success";
		}
	},
	tileInfo : function(input) {
		switch (input) {
		case 1:
			return "Открыта";
		case 2:
			return "На согласовании";
		case 3:
			return "Оформлена";
		case 4:
			return "Не доступна";
		case 5:
			return ""; // fixed benefits
		}
	},

	spellDate : function(input) {
		me = travel_emp.util.Formatter;
		var date = me.checkDateType(input);
		return date.getDate() + ' ' + me.aMonth[date.getMonth()] + ' '
				+ date.getFullYear();
	},

	spellDateRange : function(from, to) {
		if (!from || !to) {
			return;
		}
		me = travel_emp.util.Formatter;
		from = me.checkDateType(from);
		to = me.checkDateType(to);
		var sLeft = from.getDate(), sRight = me.spellDate(to);

		if (from.getYear() != to.getYear()) {
			sLeft += ' ' + aMonth[from.getMonth()];
			sLeft += ' ' + from.getFullYear();
		} else if (from.getMonth() != to.getMonth()) {
			sLeft += ' ' + aMonth[from.getMonth()];
		}

		return sLeft + ' - ' + sRight;
	},

	statusImg : function(status) {
		var get = travel_emp.util.Formatter.getImg;
		switch (parseInt(status)) {
		case 1:
			return get("Clock-gray.png");
		case 2:
			return get("Clock-orange.png");
		case 3:
			return get("Done-green.png");
		case 4:
			return get("Cancel-red.png");
		case 5:
			return get("Closed-grey.png");
		default:
			return "";
		}
	},

	getImg : function(name) {
		return jQuery.sap.getResourcePath("travel_emp/resources/img/" + name);
	},

	getInfoImg : function() {
		return travel_emp.util.Formatter.getImg("info.png");
	},

	tableRowCount : function(array) {
		return (array && array.length) ? array.length : 1;
	},

	// General
	checkDateType : function(input) {
		if (input instanceof Date) {
			return input;
		} else {
			return new Date(Date.parse(input))
		}
	},

	castBoolean : function(value) {
		return value == "true";
	},

	isNotEmpty : function(value) {
		return !!(value);
	},

	padZero : function(number, psitions) {
		return (new Array(positions + 1).join('0') + number).substr(-positions,
				positions);
	},

	sum : function(a, b, c, d) {
		return a + b + c + d;
	}

}