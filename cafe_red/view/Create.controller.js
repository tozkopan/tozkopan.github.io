jQuery.sap.require("mvideo.cafe.util.Formatter");
jQuery.sap.require("sap.ui.core.IconPool");

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
		this.startWizard( evt.getSource().getBindingContext() );
	},
	startWizard: function(oCtx, _buy) {
		this.app._oMasterNav.setVisible(false);
		var viewWizard = this.app.getDetailPage("Wizard");
		var pageWizard = viewWizard.byId("pageWizard");
		pageWizard.destroyContent();
		var oWizard = new sap.m.Wizard({
			id: "myWizard",
			showNextButton: false
		});
		oWizard.addStyleClass("myWizard");
		oWizard._buy = _buy;
		pageWizard.addContent( oWizard );
		viewWizard.getController()._wizard = oWizard;
		//this.app.getDetailPage("Wizard").byId("myWizard");
		
		var btnCompleteText = "Добавить в корзину";
		var btnCompleteIcon= "sap-icon://cart";
		if(_buy){
			btnCompleteText = "Подтвердить";
			btnCompleteIcon = "sap-icon://sys-enter-2";
		}
		viewWizard.byId("btnComplete").setText(btnCompleteText);
		viewWizard.byId("btnComplete").setIcon(btnCompleteIcon);
		
		var oData = oCtx.getModel().getProperty( oCtx.getPath() );
		var stepSetup = {
			fields: 	oData.fields && oData.fields.length > 0,
			templates: 	oData.templates && oData.templates.length > 0,
			files:		oData.files && oData.files.length > 0
		};

		oWizard.addStep( new sap.m.WizardStep({
			id: "step1",
			title: "Общая информация",
			content: [ new sap.ui.xmlfragment("mvideo.cafe.view.step1", viewWizard.getController()) ]
		}));
		if (stepSetup.fields) {
			oWizard.addStep( new sap.m.WizardStep({
				id: "step2",
				title: "Введите данные",
				content: [ new sap.ui.xmlfragment("mvideo.cafe.view.step2", viewWizard.getController()) ]
			}));			
		}
//		this.getView().setModel("fields", new sap.ui.model.json.JSONModel(stepSetup.fields));
		if (stepSetup.templates) {
			oWizard.addStep( new sap.m.WizardStep({
				id: "step3",
				title: "Шаблоны документов",
				content: [ new sap.ui.xmlfragment("mvideo.cafe.view.step3", viewWizard.getController()) ]
			}));
		}
		if (stepSetup.files) {
			oWizard.addStep( new sap.m.WizardStep({
				id: "step4",
				title: "Прикрепление файлов",
				content: [ new sap.ui.xmlfragment("mvideo.cafe.view.step4", viewWizard.getController()) ]
			}));
		}
		step5 = new sap.m.WizardStep({
			id: "step5",
			title: "Подтверждение",				
			content: [ new sap.ui.xmlfragment("mvideo.cafe.view.step5", viewWizard.getController()) ]
		});
		if (stepSetup.fields){
			step5.addContent( new sap.m.Text() ); //spacer
			step5.addContent( new sap.ui.xmlfragment("mvideo.cafe.view.step2", viewWizard.getController()) );
		}
		if (stepSetup.files){
			step5.addContent( new sap.m.Text() ); //spacer
			var step4text = new sap.m.Text({text:"Документы:"});
			step4text.addStyleClass("sapUiFormTitle sapUiFormTitleH3");
			step5.addContent( step4text );
			step5.addContent( new sap.ui.xmlfragment("mvideo.cafe.view.step4", viewWizard.getController()) );			
		}
		oWizard.addStep( step5 );
		
		oWizard.addEventDelegate({
			onAfterRendering : function() {
				var lastStep = $(".sapMWizardProgressNavList", oWizard.$()).children().last().children();
				lastStep.text(
					sap.ui.core.IconPool.getIconInfo("flag").content		
				);
				lastStep.attr("style","font-family:SAP-icons");
            }
        });
		
		this.app.handleDetail(oCtx, "Wizard", true);
		viewWizard.getController().handleStep("step1");
	},
});