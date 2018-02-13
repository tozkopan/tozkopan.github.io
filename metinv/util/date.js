sap.ui.define([
	"sap/ui/core/LocaleData"
], function(LocaleData) {
	"use strict";
	
	var oDateUtils = {};
	
	oDateUtils._LocaleData = LocaleData.getInstance(
		new sap.ui.core.Locale(
			sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString()
		)
	);
	
	oDateUtils._aMonthNames = oDateUtils._LocaleData.getMonths( //getMonthsStandAlone
		"wide", //"narrow","abbreviated"
		sap.ui.getCore().getConfiguration().getCalendarType()
	);
	
	oDateUtils.monthName = function(iMonth) {
		return oDateUtils._aMonthNames[iMonth] || "";
	};
	
	oDateUtils.formatDate = function(dDate) {
		if (!dDate) {
			return "";
		}
		if (!(dDate instanceof Date)) {
			return dDate;
		}
		return [
			dDate.getDate(),
			oDateUtils.capitalizeFirstLetter(oDateUtils.monthName(dDate.getMonth())),
			dDate.getFullYear()
		].join(" ");
	};
	
	oDateUtils.capitalizeFirstLetter = function(sString) {
		return sString.charAt(0).toUpperCase() + sString.slice(1);
	};
	
	oDateUtils.formatTime = function(sTime) {
		return sTime && +sTime.slice(0, -4) + ":" + sTime.substr(-4, 2);
	};
	
	oDateUtils.formatDateRange = function(dFrom, dTo) {
		if(!dFrom){
			return "";
		}
		if(!dTo){
			dTo = dFrom;
		}
		if(dFrom > dTo){
			var dTemp = dFrom;
			dFrom = dTo;
			dTo = dTemp;
		}
		var aDates = [dFrom, dTo].map(function(dDate){
			return [
				dDate.getDate(),
				oDateUtils.capitalizeFirstLetter(oDateUtils.monthName(dDate.getMonth())),
				dDate.getFullYear()
			];
		});
		for (var i = 2; i >= 0; i--) {
			if(aDates[0][i] === aDates[1][i]){
				aDates[0].splice(i, 1);
			}
		}
		aDates = aDates.map(function(a){ return a.join(" "); });
		if(aDates[0]){
			return aDates[0] + " - " + aDates[1];
		}else{
			return aDates[1];
		}
	};
	
	oDateUtils.addDays = function(dDate, delta) {
		if(!dDate){ return undefined; }
		var dNewDate = new Date(dDate.getTime()),
			iDelta = +delta || 0;
		dNewDate.setDate(dNewDate.getDate() + iDelta);
		return dNewDate;
	};
	
	oDateUtils.dateFromAbap = function(sDate) {
		return (!sDate) ? null : new Date(
			sDate.substr(0, 4),
			sDate.substr(4, 2) - 1,
			sDate.substr(6, 2)
		);
	};
	
	oDateUtils.dateToAbap = function(dDate) {
		return (!dDate) ? "" : ""
		+dDate.getFullYear()
		+ ("0" + (dDate.getMonth() + 1)).substr(-2)
		+ ("0" + dDate.getDate()).substr(-2);
	};
	
	//31.12.1999
	oDateUtils.formatDateSimple = function(dDate) {
		if (!dDate) {
			return "";
		}
		if (!(dDate instanceof Date)) {
			return dDate;
		}
		var sDate = ("00" + dDate.getDate()).substr(-2),
			sMonth = ("00" + (dDate.getMonth() + 1)).substr(-2),
			sYear = dDate.getFullYear();
		return sDate + "." + sMonth + "." + sYear;
	};
	
	//1999
	oDateUtils.getYear = function(dDate) {
		return dDate && dDate.getFullYear() || "";
	};
	
	return oDateUtils;
});