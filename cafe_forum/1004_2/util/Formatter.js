jQuery.sap.declare("mvideo.cafe.util.Formatter");

mvideo.cafe.util.Formatter = {
	myApp : sap.ui.getCore().myApp,
	aMonth : [ "января", "февраля", "марта", "апреля", "мая", "июня", "июля",
			"августа", "сентября", "октября", "ноября", "декабря" ],
	aMonthStop : [ "январь", "февраль", "март", "апрель", "май", "июнь", "июль",
			"август", "сентябрь", "октябрь", "ноябрь", "декабрь" ],
			
	notificationUnread: function(aList){
		return aList && aList.filter(function(item){
			return !item.Read;
		}).length;
	},
	notificationDateTime: function(sDate, sTime){
		var dTime = new Date(
			sDate.slice(0,4),
			+sDate.slice(4,6) - 1,
			sDate.slice(6,8),
			sTime.slice(0,2),
			sTime.slice(2,4),
			sTime.slice(4,6)
		);
		return dTime.toLocaleDateString() + " " + dTime.toLocaleTimeString();
	},
			
	step2hcodeVis : function(link, all, dummy) {
		if( !link || !all || !all.length ){ return; }
		switch (link) {
		case 'CELLPHONE':
			var option = $.grep(all, function(i){
				i.Link == "CELLPHONE_OPTION";
			})[0];
			if (option === 'P' || option === 'T') {
				return true;
			} else {
				return false;
			}
		break;
		}
		return true;
	},
	tileTooltip : function(tile, obtained, groups, tiles, limits) {
		var bBlockedByMaxNumber = !mvideo.cafe.util.Formatter.oldTileEnabled(tile, obtained, groups, tiles);
		if(bBlockedByMaxNumber){
			return "Превышено число добавления льгот такого типа";
		} else if (limits && tile && (limits.Available + limits.OverdraftLimit - limits.Overdraft) < tile.Price){
			return "Невозможно добавить льготу, превышен лимит за свой счет";
		}
	},
	tileEnabled : function(tile, obtained, groups, tiles, limits) {
		return !mvideo.cafe.util.Formatter.tileTooltip(tile, obtained, groups, tiles, limits);
	},
	oldTileEnabled : function(tile, obtained, groups, tiles) {
		if(!tile || !obtained) { return true; }
		var oCart = obtained;
		var aCart = [];
		oCart.forEach(function(cart) {
			aCart = aCart.concat(cart.content);
		});
		if(!aCart || !aCart.length){ return true; }//empty cart
		
		if(aCart.filter(function(c){ //no same tile twice
			return c.BenefitId === tile.BenefitId && c.Benefit2Id === tile.Benefit2Id;
		}).length){
			return false;
		}

		var oGroup = groups.filter(function(a){
			return a.Tilegroup === tile.Tilegroup;
		})[0];
		
		if(!oGroup){ return true; }
		var aGroupTiles = tiles.filter(function(t){
			return t.Tilegroup === oGroup.Tilegroup;
		});
		
		var iInCart = 0;
		aCart.forEach(function(c){
			aGroupTiles.forEach(function(t){
				if(c.BenefitId === t.BenefitId && c.Benefit2Id === t.Benefit2Id){
					iInCart++;
				}
			});
		});
		
		if(+oGroup.MaxNum && iInCart >= +oGroup.MaxNum){
			return false; //maximum reached
		}
		
		return true; //default
	},
	
	seqnrCurls : function(pskey) {
		if(!pskey){ return ''; }
		var seqnr = parseInt( pskey.substr(-3,1) );
		return (seqnr > 0) ? ' (' + seqnr + ')' : '';
	},
	
	overPriceUsual : function(aLimits, price) {
		return 1 == mvideo.cafe.util.Formatter._overPrice(aLimits, price);
	},
	
	overPriceCritical : function(aLimits, price) {
		return 2 == mvideo.cafe.util.Formatter._overPrice(aLimits, price);
	},

	overPriceAny1 : function(aLimits, price, curStep, deducIncrease) {
		return 0 < mvideo.cafe.util.Formatter._overPrice(aLimits, price)
			&& curStep == 1
			&& !(deducIncrease === "true" || deducIncrease === true);
	},

	overPriceAny2 : function(aLimits, price, curStep, deducIncrease, calc) {
		return 0 < mvideo.cafe.util.Formatter._overPrice(aLimits, price)
			&& curStep == 2
			&& calc
			&& !(deducIncrease === "true" || deducIncrease === true);
	},

	_overPrice : function(aLimits, price) {
		if(!aLimits || !aLimits.length || !price )
			return -1;
		
		var iPrice = parseInt(price);
		var iAvailable = jQuery.grep(aLimits, function(i){ return i.id === "Available"; })[0].price;
		var iOverdraft = jQuery.grep(aLimits, function(i){ return i.id === "Overdraft"; })[0].price;
		var iOverLimit = jQuery.grep(aLimits, function(i){ return i.id === "OverdraftLimit"; })[0].price;
		
		var bCritical = iPrice > iAvailable + iOverLimit - iOverdraft;
		var bOverflow = iPrice > iAvailable;
		
		if (bCritical) 		return 2; //critical
		else if(bOverflow) 	return 1; //overflow, but not critical
		else 				return 0; //no overflow
	},

	
	assureDate : function(input) {
		var value = input;
		if (!(value instanceof Date)){
			value = null;
		}
		return value;
	},
			
	sendVisible : function(groups) {
		var bVisible = false;
		if(groups && groups.length){			
			groups.forEach(function(item){
				if(+item.status === 20 && item.content && item.content.length){
					bVisible = true;
				}
			});
		}
		return bVisible;
		// return !!(groups && groups.length && groups.some(function(item){
		// 	return +item.status === 20 && item.content && item.content.length;
		// }));
	},
	
	getStatusText : function(code) {
		if(!this.getModel){ return; }
		var oSettings = this.getModel("settings");
		if(!oSettings){ return; }
		var aStatus = oSettings.getProperty("/statuses");
		if(!aStatus){ return; }
		var aText = $.grep(aStatus, function(e){
			return +e.id === +code;
		});
		if(aText && aText[0]){
			return aText[0].name;
		}
	},
			
	getListMode : function(code) {
		return (+code === 20) ? "Delete" : "None";
	},
	
	isListModeDelete : function(code) {
		return (+code === 20);
	},
	
	getGroupSum : function(array) {
		var sum = 0;
		array.forEach(function(item){
			sum += parseFloat(item.Betrg);
		});
		return mvideo.cafe.util.Formatter.formatMoney(sum);
	},
	getGroupHeader : function(code) {
		var aGroups = sap.ui.getCore().myApp.getModel().getProperty("/groups");
		if (aGroups && aGroups.length > 0) {
			return aGroups.filter(function(item) {
				return (item.id == code);
			})[0].name;
		}
	},
	
	formatMoneyDyn : function(dyn, input, decimals, delimiter) {
		var text = mvideo.cafe.util.Formatter.formatMoney(input, decimals, delimiter);
		if(+input === 0){
			return '';
		}else if(dyn === true || dyn === 'true'){
			text = 'от ' + text;
		}
		return text;
	},
	formatMoneyFree : function(input) {
		var text = mvideo.cafe.util.Formatter.formatMoney(input);
		if(+input === 0){
			// return 'Бесплатно';
			return '';
		}
		return text;
	},
	
	formatMoney : function(input, decimals, delimiter) {
		var oBundle = mvideo.cafe.util.Formatter.myApp.getModel("i18n").getResourceBundle();
	    var iMoney = parseFloat(input).toFixed(decimals);
	    // return iMoney.toString() + oBundle.getText("CMN_MONEY_ABBR");
	    // return "♥ " + iMoney.toString();
	    // return "❤ " + iMoney.toString();
	    // return "♡ " + iMoney.toString();
	    return iMoney.toString();
	},
	
	formatMoney_old : function(input, decimals, delimiter) {
		var oBundle = mvideo.cafe.util.Formatter.myApp.getModel("i18n").getResourceBundle();
		if(delimiter === undefined){ delimiter = ','; }
		var parts = parseFloat(input).toFixed(decimals).toString().split(".");
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
	    return parts.join(".") + oBundle.getText("CMN_MONEY_ABBR_OLD");
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
			return "В корзине";
		case 2:
			return "На согласовании";
		case 3:
			return "Оформлена";
		case 4:
			return "Не доступна";
		case 5:
			return "Вне лимита"; // fixed benefits
		}
	},

	spellDate : function(input) {
		_me = mvideo.cafe.util.Formatter;
		var date = _me.checkDateType(input);
		return date.getDate() + ' ' + _me.aMonth[date.getMonth()] + ' '
				+ date.getFullYear();
	},
	
	spellDateStop : function(input) {
		_me = mvideo.cafe.util.Formatter;
		var date = _me.checkDateType(input);
		return _me.aMonthStop[date.getMonth()] + ' '
				+ date.getFullYear();
	},

	spellDateRange : function(from, to) {
		if (!from || !to) {
			return;
		}
		_me = mvideo.cafe.util.Formatter;
		from = _me.checkDateType(from);
		to = _me.checkDateType(to);
		var sLeft = from.getDate(), sRight = _me.spellDate(to);

		if (from.getYear() != to.getYear()) {
			sLeft += ' ' + aMonth[from.getMonth()];
			sLeft += ' ' + from.getFullYear();
		} else if (from.getMonth() != to.getMonth()) {
			sLeft += ' ' + aMonth[from.getMonth()];
		}

		return sLeft + ' - ' + sRight;
	},

	statusImg : function(status) {
		var get = mvideo.cafe.util.Formatter.getImg;
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
		return mvideo.cafe.util.Formatter.getImg("info.png");
	},

	tableRowCount : function(array) {
		return (array && array.length) ? array.length : 1;
	},
	
	mainListPanelExpandIcon : function(expanded) {
//		return expanded ? "less" : "add";
		return expanded ? "navigation-up-arrow" : "navigation-down-arrow";
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
	
	length : function(x){
		return x && x.length;
	},
	
	lengthOrOne : function(x){
		return x && x.length || 1;
	},
	
	sameOrSpace : function(x){
		return x || ' ';
	},
	
	padZero : function(number, psitions) {
		return (new Array(positions + 1).join('0') + number).substr(-positions,
				positions);
	},
	parseInt: function(x) {
		return parseInt(x);
	},
	sum : function(a, b, c, d) {
		return a + b + c + d;
	}

}