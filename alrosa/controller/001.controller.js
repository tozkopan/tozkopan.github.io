sap.ui.define([
	"alrosa/controller/Base.controller"
], function(Controller) {
	"use strict";

	return Controller.extend("alrosa.controller.001", {
		onInit: function(){
			this._wizard = this.byId("wiz001");
			
			// this._wizard.bindElement("/001");
			// this._wizard.bindObject({ path: "/001"});
			this.byId("form001step02").bindElement({ path: "/001"});
		},
		wizardComplete: function(){
			
		}
	});
});