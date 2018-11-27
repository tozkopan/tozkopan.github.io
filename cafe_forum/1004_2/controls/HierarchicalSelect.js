/*jQuery.sap.require("sap.uxap.HierarchicalSelect");
 
sap.uxap.AnchorBar.extend("mvideo.cafe.controls.HierarchicalSelect", {*/

sap.ui.define([
	"sap/uxap/HierarchicalSelect",
	"sap/m/SelectList"
], function(BaseControl, SelectList) {
	"use strict";

	var Control = BaseControl.extend("mvideo.cafe.controls.HierarchicalSelect", {
		metadata: {},
		renderer: {}
	});

	var oldAfterRendering = Control.prototype.onAfterRenderingPicker;
	Control.prototype.onAfterRenderingPicker = function() {
		oldAfterRendering.call(this);
		//	var result = oldAfterRendering.apply(this, arguments);
		this._oList.$().addClass("MVideo_cafe");
		var aItems = this.getItems() || [];
		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].$().hasClass("sapUxAPHierarchicalSelectSecondLevel")) {
				aItems[i].$().addClass("mvSecondLevel");
				aItems[i].$().hide();
			} else if (aItems[i + 1]) {
				if (aItems[i].$().hasClass("sapUxAPHierarchicalSelectFirstLevel") && aItems[i + 1].$().hasClass(
						"sapUxAPHierarchicalSelectSecondLevel")) {
					aItems[i].$().addClass("mvFirstLevel");
					aItems[i].$().click(function(evt) {
						var item = $(evt.currentTarget);
						var bShow = item.hasClass("mvOpen");
						while (~item[0].nextSibling.className.indexOf("mvSecondLevel")) {
							if (bShow) {
								$(item[0].nextSibling).hide();
							} else {
								$(item[0].nextSibling).show();
							}
							item = $(item[0].nextSibling);
						}
						$(evt.currentTarget).toggleClass("mvOpen", !bShow);
					}.bind(this));
				}
			}
		}
	};
	
	Control.prototype.createList = function() {
			var mListKeyboardNavigationMode = sap.m.SelectListKeyboardNavigationMode,
				sKeyboardNavigationMode = sap.ui.Device.system.phone ? mListKeyboardNavigationMode.Delimited : mListKeyboardNavigationMode.None;

			this._oList = new SelectList({
				width: "100%",
				keyboardNavigationMode: sKeyboardNavigationMode
			}).addStyleClass(this.getRenderer().CSS_CLASS + "List-CTX")
			.addEventDelegate({
				ontap: function(oEvent) {
					if (!~oEvent.target.className.indexOf("mvFirstLevel")) {
						this.close();
					}
				}
			}, this)
			.attachSelectionChange(this.onSelectionChange, this);
			return this._oList;
		};

	return Control;

}, true);