sap.ui.controller("mvideo.cafe.view.Detail", {
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
		this.app.backDetail();
	},
});