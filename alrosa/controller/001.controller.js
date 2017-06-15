sap.ui.define([
	"alrosa/controller/Base.controller"
], function(Controller) {
	"use strict";

	return Controller.extend("alrosa.controller.001", {
		onInit: function(){
			this._wizard = this.byId("wiz001");
		},
		wizardComplete: function(){
			
		},
		wizardNavForward: function(bForward){
			this.wizardNav(true);
		},
		wizardNavBack: function(){
			this.wizardNav(false);
		},
		wizardNav: function(bForward){
			if(bForward){
				this._wizard.nextStep();
			}else{
				this._wizard.previousStep();
			}
			this.getModel("util").setProperty("/001/step", this._wizard.getProgress());
		}
	});
});