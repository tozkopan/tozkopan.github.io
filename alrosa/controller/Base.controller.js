sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("alrosa.controller.001", {
		byId: function(sName){
			return this.getView().byId(sName);
		},
		getModel: function(sName){
			return this.getModel(sName) || this.getOwnerComponent().getModel(sName);
		},
		getText: function(sName){
			return this.getModel("i18n").getResourceBundle().getText(sName);
		},
		getRouter: function(){
			return this.getOwnerComponent().getRouter();
		},
		navBack: function(){
			// var oRouter = this.getRouter();
			window.history.go(-1);
		},
		navFromButton: function(evt){
			var sTarget = evt.getSource().data("target");
			this.getRouter().navTo(sTarget);
			
		}
	});
});