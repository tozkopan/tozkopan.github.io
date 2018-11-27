sap.ui.define([
	"sap/uxap/ObjectPageLayout",
	"mvideo/cafe/controls/ObjectPageLayoutABHelper"
],function(BaseControl, ABHelper) {
	"use strict";
	
	var Control = BaseControl.extend("mvideo.cafe.controls.ObjectPageLayout",{
		metadata: {},
		renderer: {}
	});
	
	Control.prototype.init = function(){
		var oReturn = BaseControl.prototype.init.apply(this, arguments);
		//monkey patch this magnificient piece of shit
		var sName = this.getMetadata().getName();
	    sap.uxap.Utilities.getClosestOPL = function(c) {
	        while (c && c.getMetadata().getName() !== "sap.uxap.ObjectPageLayout"
	        && c.getMetadata().getName() !== sName) {
	            c = c.getParent();
	        }
	        return c;
	    };
		//replace with extended version
		this._oABHelper = new ABHelper(this);
		
		return oReturn;
	};
	
	return Control;

}, /* bExport= */ true);