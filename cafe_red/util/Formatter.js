jQuery.sap.declare("mvideo.cafe.util.Formatter");

mvideo.cafe.util.Formatter = {
	aMonth : [ "января", "февраля", "марта", "апреля", "мая", "июня", "июля",
			"августа", "сентября", "октября", "ноября", "декабря" ],
			
	calcField : function(row,fields){
		alert("OK");
		if(1 == 1){
		}
	},
	fnResidue : function(limit,benefits){
		var residue = limit;
		for (ben in benefits){
			if (ben != "fix") {
				benefits[ben].content.forEach(function(item){
					residue -= parseFloat(item.price);
				});
			}
		}
		return residue;
	},
	
	fnOverdraftLimit : function(benefits){		
		var overdraft_limit = 0;
		benefits.cart.content.forEach(function(item){
			if(item.overdraft)
				overdraft_limit += parseFloat(item.price);
		});
		return overdraft_limit;
	},
			
	getLimit: function(type,limit,benefits){
		me = mvideo.cafe.util.Formatter;
		switch (type) {
		case "total":
			return limit;
		case "available":
			var residue = me.fnResidue(limit,benefits);
			return (residue > 0) ? residue : 0;
		case "overdraft_limit":
			return me.fnOverdraftLimit(benefits);
		case "overdraft":
			var residue = me.fnResidue(limit,benefits);
			if(residue >= 0){				
				return 0;
			}else{				
				return me.fnOverdraftLimit(benefits) + residue;
			}
		}		
	},

	getLimitVisible: function(type,limit,benefits){
		me = mvideo.cafe.util.Formatter;
		switch (type) {
		case "total":
			return true;
		case "available":
			return true;
		case "overdraft_limit":
			return ( me.fnOverdraftLimit(benefits) > 0);
		case "overdraft":
			return ( me.fnOverdraftLimit(benefits) > 0);
		}		
	},

	getListMode : function(code) {
		return (code == "cart")?"Delete":"None";
	},
	
	getGroupSum : function(array) {
		var sum = 0;
		array.forEach(function(item){
			sum += parseFloat(item.price);
		});
		return mvideo.cafe.util.Formatter.formatMoney(sum);
	},
	getGroupHeader : function(code) {
		if(!code) return;
		var data = sap.ui.getCore().myApp.myData;
		if(!data) return;
		return $.grep(data.groups, function(j){ return j.id == code; })[0].name;
	},
	formatMoney : function(input, decimals, delimiter) {
		if(delimiter === undefined){ delimiter = ','; }
		var parts = parseFloat(input).toFixed(decimals).toString().split(".");
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
	    return parts.join(".") + ' р.';
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
		if(!input) return;
		var data = sap.ui.getCore().myApp.myData;
		if(!data) return;
		return data.status[input].name;
	},
	tileInfo : function(input) {
		if(!input) return;
		var data = sap.ui.getCore().myApp.myData;
		if(!data) return;
		return data.status[input].name;
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

	isArrayNotEmpty : function(array) {
		return !!(array && array.length);
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
	}

}