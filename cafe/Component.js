sap.ui.define([ "sap/ui/core/UIComponent" ], function(UIComponent) {
	"use strict";
	return UIComponent.extend("mvideo.cafe.Component", {
		metadata : {
		// rootView : "sap.ui.demo.wt.view.App"
		},
		createContent : function() {
			this.app = new sap.m.SplitApp({
				"mode" : sap.m.SplitAppMode.ShowHideMode
			});
			this.app.setBackgroundColor("white");

			this.app.handleDetail = function(context, view, edit) {
				var oView = this.getPage(view);
				oView.getModel("local").setProperty("/edit", edit);
				oView.getModel("local").setProperty("/edit_f", edit);
				oView.getModel("local").setProperty("/nedit", !edit);
				oView.getModel("local").setProperty("/nedit_f", !edit);
				if (context) {
					oView.setBindingContext(context);
					this.toDetail(view);
				}
			}.bind(this.app);

			return this.app;
		},
		init : function() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			sap.ui.getCore().myApp = this.app;

			this.app.addPage(sap.ui.view({
				id : "Master",
				viewName : "mvideo.cafe.view.Master_panel",
				// viewName : "mvideo.cafe.view.Master",
				type : "XML",
				viewData : {
					component : this
				}
			}), true);

			this.app.addPage(sap.ui.view({
				id : "Empty",
				viewName : "mvideo.cafe.view.Empty",
				type : "XML",
				viewData : {
					component : this
				}
			}), false);

			this.app.addPage(sap.ui.view({
				id : "Create",
				viewName : "mvideo.cafe.view.Create",
				type : "XML",
				viewData : {
					component : this
				}
			}), false);
			this.app.addPage(sap.ui.view({
				id : "Detail",
				viewName : "mvideo.cafe.view.Detail",
				type : "XML",
				viewData : {
					component : this
				}
			}), false);

			this.app.addPage(sap.ui.view({
				id : "Wizard",
				viewName : "mvideo.cafe.view.Wizard",
				type : "XML",
				viewData : {
					component : this
				}
			}), false);

			this.app.setInitialDetail("Create");
			// this.app.setInitialDetail("Detail");

			// set data model
			var oModel = new sap.ui.model.json.JSONModel("model/main.json");
			this.setModel(oModel);

			// set i18n model
			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl : "i18n/messageBundle.properties"
			});
			this.setModel(i18nModel, "i18n");

		}
	});
});