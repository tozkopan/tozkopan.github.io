jQuery.sap.require("mvideo.cafe.util.Formatter");

sap.ui.controller("mvideo.cafe.view.Master", {
	onInit : function() {
		this.app = this.getView().getViewData().component.app;
		this.getView().bindContext("/");
	},
	// onBeforeRendering: function() {
	// },
	// onAfterRendering: function() {
	// },
	// onExit: function() {
	// }
	onSend : function() {
//		sap.m.MessageBox.information("sdsdsd");
		var cPath = "/buy"
		var oModel = this.getView().getModel();
		var data = {
			name: "Превышение лимита",
			description: "Ваш лимит был превышен, поэтому вам нужно подписать заявление на ужержание."
				+ "Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст "	
				+ "Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст "	
				+ "Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст Текст ",
			files: [
				{
					name: "Согласие на удержание"
				}
			],
			templates: [
				{
					name: "Шаблон согласия на удержание",
					link: ""
				}
			]
		};
		
				
		oModel.setProperty(cPath,data);
		var oCtx = new sap.ui.model.Context(oModel, cPath);
		this.app.getDetailPage("Create").getController().startWizard(oCtx, true);
		
		return;
		
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
	
	onYearSelect : function(evt){
		var sKey = evt.getParameter("selectedItem").getKey();
		var sText = evt.getParameter("selectedItem").getText();
		var oHeader = this.getView().byId("masterHeader");
		if(sKey == 0){
			oHeader.setText("Мои льготы");
			this.app.setInitialDetail("Create");
			this.app.toDetail("Create");
			this.getView().bindContext("/");
			this.getView().byId("btnSend").setVisible(true);
		}else{
			oHeader.setText( sText );
			this.app.setInitialDetail("Empty");
			this.app.toDetail("Empty");
			this.getView().bindContext("/history/" + sKey);
			this.getView().byId("btnSend").setVisible(false);
		}
	},
	
	onLimitHelp : function(evt){
		if (! this._oLimitHelp) {
			this._oLimitHelp = sap.ui.xmlfragment("mvideo.cafe.view.limit_help", this);
			this.getView().addDependent(this._oLimitHelp);
		}
		var oSrc = evt.getSource();
		var oModel = this.getView().getModel();
		oModel.setProperty("/limit_help",{
			info: oSrc.data("text")
		});
		
		jQuery.sap.delayedCall(0, this, function () {
			this._oLimitHelp.openBy(oSrc);
		});
	},

});