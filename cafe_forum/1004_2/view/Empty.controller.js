jQuery.sap.require("mvideo.cafe.util.Formatter");
jQuery.sap.require("mvideo.cafe.util.Helper");

sap.ui.controller("mvideo.cafe.view.Empty", {
	f: mvideo.cafe.util.Formatter,
	helper : mvideo.cafe.util.Helper,
	
	onShowMaster: function(){
		this.app.toMaster("Master");
	},
	
	onMobileBackToMaster: function(evt){
		this.app.backToTopDetail();
	},


	onInit: function() {
		this.app = this.getView().getViewData().component.app;
	},	
// onBeforeRendering: function() {
// },	
// onAfterRendering: function() {
// },	
// onExit: function() {
// }
	onMasterAdd : function() {
		this.app.toDetail("Detail");
	},
	
	readDeduction : function(aLimits){
		var iOverdraft = jQuery.grep(aLimits, function(i){ return i.id === "Overdraft"; })[0].price;
		var oLocal = {
			vis_deduct: +iOverdraft > 0,
			deduct: []
		};
		var local = new sap.ui.model.json.JSONModel(oLocal);
		this.getView().setModel(local, "local");
		
		var odata = this.getView().getModel("odata");
		if (oLocal.vis_deduct) {
			odata.callFunction("GetDeductions",{
				urlParameters:{
					Year: this.getView().getModel().getProperty("/selectedYear")
				},
				method: 'GET',
				success: function(data,response){
					console.log('GetDeductions - success');
					local.setProperty("/deduct", data.results);
				},
				error: function(error){ }
			});
		}
	},
	
	onNotifications: function(){
		this.helper.onNotifications.apply(this, arguments);
	},
	
	onMainHelp: function(evt){
		this.getView().getViewData().component.showMainHelp();
	}
});