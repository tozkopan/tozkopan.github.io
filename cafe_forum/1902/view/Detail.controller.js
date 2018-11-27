sap.ui.controller("mvideo.cafe.view.Detail", {
//mvideo.cafe.view.Common.extend("mvideo.cafe.view.Detail",{
	
	helper : mvideo.cafe.util.Helper,
	
	onInit: function() {
		this.app = this.getView().getViewData().component.app;
		this.getView().setModel(new sap.ui.model.json.JSONModel({}),"local");
	},	
// onBeforeRendering: function() {
// },	
// onAfterRendering: function() {
// },	
// onExit: function() {
// }
	handleStep3Press : function(evt) {
		var oCtx = evt.getSource().getBindingContext("local");
		var oEntity = jQuery.extend(true, {}, oCtx.getProperty( oCtx.getPath() ) );
		var aFields = jQuery.extend(true, [], this.getView().getModel("local").getProperty("/step2/fields") );
		
		this.app.getDetailPage("Wizard").getController()._handleStep3Press(oEntity, aFields);
	},
	onMasterAdd : function() {
		this.app.toDetail("Detail");
	},
	onCancel : function() {
		this.app.backDetail();
	},
	onSend : function() {
		this.app.handleDetail(
			null, false
		);
	},
	handleBack: function(evt){
//		this.app.backDetail();
		this.app.backToTopDetail();
	}
});