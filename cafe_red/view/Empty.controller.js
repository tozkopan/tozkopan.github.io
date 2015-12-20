sap.ui.controller("mvideo.cafe.view.Empty", {
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
});