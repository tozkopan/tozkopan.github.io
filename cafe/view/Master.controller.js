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
	
	
	onDelete : function(evt) {
		MB = sap.m.MessageBox;
		var listItem = evt.getParameter("listItem");
		var oList = evt.getSource();
		var that = this;
		MB.confirm("Вы действительно хотите удалить льготу из корзины?",{
			title:"Подтверждение",
			onClose: function(action){
				if(action == MB.Action.OK){
					that.handleDelete(listItem, oList);
				}
			}
		});
	},

	handleDelete : function(listItem, oList) {
		//var listItem = evt.getParameter("listItem");
		//var oList = evt.getSource();
		var sPath = listItem.getBindingContext().getPath();
		var oModel = oList.getModel();
		//binding path to all items
		var sUpPath = sPath.split("/").slice(0,-1).join("/");
		var aItems =  oModel.getProperty( sUpPath );
		var oItem =  oModel.getProperty( sPath );
		aItems.splice( aItems.indexOf(oItem), 1);
		//oList.removeItem(listItem);
		oModel.refresh(true);
		oList.refreshItems();
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