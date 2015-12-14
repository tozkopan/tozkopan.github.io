jQuery.sap.require("mvideo.cafe.util.Formatter");

sap.ui.controller("mvideo.cafe.view.Master", {
	onInit : function() {
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
		this.app.handleDetail(evt.getSource().getBindingContext(), false);
	},

	getGroupHeader : function(oGroup) {
		var sName = mvideo.cafe.util.Formatter.getGroupHeader(oGroup.key)
		return new sap.m.GroupHeaderListItem({
			title : sName,
			upperCase : false
		});
	},
	getAvailableHeader : function(oGroup) {
		var sName = mvideo.cafe.util.Formatter.tileInfo(oGroup.key)
		var header = new sap.m.DisplayListItem({
			label : sName,
			value : 12000
		});
		header.addStyleClass("sapMGHLI");
		return header;
		// var header2 = new sap.m.CustomListItem( {
		// content:[
		// new sap.m.HBox({
		// justifyContent:"SpaceBetween",
		// item:[
		// new sap.m.HBox({
		// item:[
		// new sap.ui.core.Icon({src:"sap-icon://add"}),
		// new sap.m.Text({text:"AAAA"}),
		// ]
		// }),
		// new sap.m.Text({text:"BBBB"})
		// ]
		// })
		// ]
		// } );
	},

});