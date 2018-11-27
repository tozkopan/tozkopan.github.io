sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/ODataModel"
], function(BaseObject, MockServer, ODataModel) {
	"use strict";


	return BaseObject.extend("mvideo.cafe.mockserver.Main", {
		constructor : function() {
			BaseObject.call(this);
			var oMockServer = new MockServer({
			    rootUri: "http://mockserver/"
			});
			oMockServer.simulate("mockserver/metadata.xml", {
				sMockdataBaseUrl : "mockserver/data/",
				bGenerateMissingMockData : false
			});
			var aRequests = oMockServer.getRequests(),
				fnAdd = function(sName, oData){
					aRequests.push({
						method: "GET",
						path: new RegExp(sName),
						response: function(oXhr, sUrlParams) {
							oXhr.respondJSON(200, {}, JSON.stringify({d:oData}));
							return true;
						}
					});
				};
			fnAdd("GetParam(.*)", {
				"Param": "STARTUP_HELP",
				"Value": "X"
			});
			fnAdd("GetPersInfo(.*)", {
			    "ToAdmin": "",
			    "Persk": "20",
			    "AdminEnameCase": "Фернандес Айсе Энрике Англу",
			    "Message": "",
			    "Stop": false,
			    "HasWarnings": "",
			    "MaxDmsRel": 1,
			    "NewMail": 0,
			    "Retail": "",
			    "Name": "Розница#Иван"
			});
			fnAdd("YearsSet\\('q'\\)\\\\Obtained", jQuery.sap.sjax({
				url: "/TEST"
			}));
			oMockServer.attachBefore("GET", function(evt){
				console.log("attachBefore: " + evt.getParameter("oXhr").url);
			}, null);
			// var oResponse = ;

			
			oMockServer.setRequests(aRequests);

			oMockServer.start();
			return new ODataModel("http://mockserver/", true);
		}
	});

});