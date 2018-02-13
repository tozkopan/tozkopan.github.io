sap.ui.define([
	"./Base.controller"
], function(Controller) {
	"use strict";

	return Controller.extend("metinv.table.controller.Launcher", {
		press: function(evt){
			var oSrc = evt.getSource(),
				oRouter = this.getRouter();
			oRouter.navTo(oSrc.data("to"), true);
		}
	});
});