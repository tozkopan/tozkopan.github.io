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
	"onSend" : function() {
//		sap.m.MessageBox.information("sdsdsd");
		MB = sap.m.MessageBox;
		MT = sap.m.MessageToast;
		MB.confirm("Вы действительно хотите отправить все льготы в корзине на согласование?"
				+ " Дальнейшие изменения возможны только через специалиста поддержки!",{
			title:"Подтверждение",
			onClose: function(action){
				if(action == MB.Action.OK){
					MT.show("Успешно отправлено!");
					this.app.backDetail();
				}
			}.bind(this)
		});
	},

	onListPress : function(evt) {
		this.app.handleDetail(evt.getSource().getBindingContext(), "Detail", false);
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
		header.attachPress(function(){console.log("ssss")});
		return header;
	},

});