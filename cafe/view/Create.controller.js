jQuery.sap.require("mvideo.cafe.util.Formatter");

sap.ui.controller("mvideo.cafe.view.Create", {
	onInit: function() {
		this.app = this.getView().getViewData().component.app;
	},	
// onBeforeRendering: function() {
// },	
// onAfterRendering: function() {
// },	
// onExit: function() {
// }
	onBack : function() {
		this.app.backDetail();
	},
	onTilePress: function(evt) {
		this.app.handleDetail(evt.getSource().getBindingContext(), "Wizard", true);
	}
});