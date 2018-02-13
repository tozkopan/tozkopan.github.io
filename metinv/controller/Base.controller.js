sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"../util/date"
], function(Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, dateUtil) {
	"use strict";

	return Controller.extend("metinv.table.controller.Base", {
		MT: MessageToast,
		JM: JSONModel,
		MB: MessageBox,
		Filter: Filter,
		FO: FilterOperator,
		DU: dateUtil,

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		navTop: function(evt) {
			this.getRouter().navTo("Launcher", true);
		},

		navBack: function() {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			}
		},

		/**
		 * Get model from view or component
		 * @param {string} sName - name of the model
		 * @return {object} - model
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName) || (this.getOwnerComponent() && this.getOwnerComponent().getModel(sName));
		},

		byId: function(sName) {
			return this.getView().byId(sName) || sap.ui.getCore().byId(sName);
		},

		/****************************************************************************************************
		 * Common handlers
		 ****************************************************************************************************/

		test: function(evt) {
			console.log("test event handler");
			console.log(evt);
		},
		
		onDialogAfterClose: function(evt) {
			evt.getSource().destroy();
		},

		/**
		 * Close dialog
		 * @param {object} evt - event or source of the event
		 */
		onDialogClose: function(evt) {
			var oSrc;
			if (evt.getSource) {
				oSrc = evt.getSource();
			} else {
				oSrc = evt;
			}
			oSrc.getParent().close();
		}

	});

});