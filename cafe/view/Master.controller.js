jQuery.sap.require("mvideo.cafe.util.Formatter");

sap.ui.controller("mvideo.cafe.view.Master", {
	onInit: function() {
		this.app = this.getView().getViewData().component.app;
	},	
// onBeforeRendering: function() {
// },	
// onAfterRendering: function() {
// },	
// onExit: function() {
// }
	onCreate : function() {
		this.app.toDetail("Create");
	},
	
	onListPress : function(evt) {
		this.app.handleDetail(
			evt.getSource().getBindingContext(), false
		);
	},
	
	getGroupHeader: function (oGroup){
		var sName = mvideo.cafe.util.Formatter.getGroupHeader(oGroup.key) 
		return new sap.m.GroupHeaderListItem( {
			title: sName,
			upperCase: false
		} );
	}
	
});