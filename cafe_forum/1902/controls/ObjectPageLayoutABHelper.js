sap.ui.define([
	"sap/uxap/ObjectPageLayoutABHelper",
	"mvideo/cafe/controls/AnchorBar"
],function(BaseControl, AnchorBar) {
	"use strict";
	
	var Control = BaseControl.extend("mvideo.cafe.controls.ObjectPageLayout",{
		metadata: {},
		renderer: {}
	});
	
	//propogate binding to custom anchor bar button
	Control.prototype._buildAnchorBarButton = function(oSectionBase, bIsSection){
		var oButtonClone = BaseControl.prototype._buildAnchorBarButton.apply(this, arguments);
		var oBtn = oSectionBase.getCustomAnchorBarButton();
		var oCtx = oSectionBase.getBindingContext();
		if(oCtx){
			oButtonClone.setBindingContext(oCtx);
		}
		if (sap.ui.Device.system.phone) {
			oButtonClone.setProperty("text", oBtn.getProperty("textB") ? (oBtn.getProperty("textA") + " " + oBtn.getProperty("textB")) : oBtn.getProperty("textA"));
		}
		return oButtonClone;
	};
	
	Control.prototype._getAnchorBar = function () {
		var oAnchorBar = this.getObjectPageLayout().getAggregation("_anchorBar");
		if (!oAnchorBar) {
			oAnchorBar = new AnchorBar({
				id: this.getObjectPageLayout().getId() + "-anchBar",
				showPopover: this.getObjectPageLayout().getShowAnchorBarPopover()
			});
			this.getObjectPageLayout().setAggregation("_anchorBar", oAnchorBar, true);
		}
		return oAnchorBar;
	};

	return Control;

}, /* bExport= */ true);