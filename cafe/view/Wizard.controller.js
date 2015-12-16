sap.ui.controller("mvideo.cafe.view.Wizard", {
	onInit : function() {
		this.app = this.getView().getViewData().component.app;
		this.getView().setModel(new sap.ui.model.json.JSONModel({}), "local");
		this._wizard = this.getView().byId("myWizard");
	},
	// onBeforeRendering: function() {
	// },
	// onAfterRendering: function() {
	// },
	// onExit: function() {
	// }
	onNext : function() {
		var iStep = this._wizard.getProgress();
		if(iStep == 4){
			this.setVisible("btnNext",false); 
			this.setVisible("btnComplete",true); 
			this.setVisible("step1",false); 
			this.setVisible("step2",false); 
			this.setVisible("step3",false); 
			this.setVisible("step4",false);
			this._wizard.mAggregations._page.getSubHeader().setVisible(false);
			this.getView().getModel("local").setProperty("/edit", false);
			this.getView().getModel("local").setProperty("/nedit", true);
		}
		if(iStep == 2){
			this.getView().getModel("local").setProperty("/edit_f", false);
			this.getView().getModel("local").setProperty("/nedit_f", true);
		}
		this._wizard.nextStep();
	},
	onPrev : function() {
		var iStep = this._wizard.getProgress();
		if(iStep == 5){
			this.setVisible("btnNext",true);
			this.setVisible("btnComplete",false);
			this.setVisible("step1",true); 
			this.setVisible("step2",true); 
			this.setVisible("step3",true); 
			this.setVisible("step4",true);
			this._wizard.mAggregations._page.getSubHeader().setVisible(true);
			this.getView().getModel("local").setProperty("/edit", true);
			this.getView().getModel("local").setProperty("/nedit", false);
		}
		if(iStep == 3){
			this.getView().getModel("local").setProperty("/edit_f", true);
			this.getView().getModel("local").setProperty("/nedit_f", false);
		}
		if (iStep == 1) {
			this.app.backDetail();
		} else if(iStep == 2) {
			this._wizard.discardProgress(
				this._wizard.getSteps()[0]
			);
		} else {			
			this._wizard.previousStep();
		}
	},
	onComplete : function(){
		this.app.backDetail();
	},
	handleBack : function(evt) {
		this.app.backDetail();
	},
	setVisible : function(id, visible) {
		this.getView().byId(id).setVisible(visible);
	},
	
});