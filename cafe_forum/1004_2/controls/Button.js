sap.ui.define([
	"sap/m/Button",
	"jquery.sap.global"
],function(BaseControl, jQuery) {
	"use strict";
	
	var Control = BaseControl.extend("mvideo.cafe.controls.Button",{
		metadata: {
			properties: {
				textA: { type: "string" },
				textB: { type: "string" }
			}
		},
		renderer: {
			// render: function(oRm, oControl){
			// 	var sRender = BaseControl.prototype.getRenderer().render.toString();
			// 	var aRender = sRender.split("{");
			// 	var sHeader = aRender.shift().match(/\(([^)]+)\)/)[1]; //function arguments
			// 	sRender = aRender.join("{").replace(/}[^}]*$/i, "");  // remove last curly bracket and everything after
			// 	sRender = sRender.replace( //only one occurrence
			// 		".writeEscaped(",
			// 		".write("
			// 	);    	
			// 	var myRender = Function(sHeader + ",q", sRender);    	
			// 	myRender(oRm, oControl, jQuery);
			// }
		}
	});
	
	Control.prototype.onAfterRendering = function () {
		var oResult = BaseControl.prototype.onAfterRendering && BaseControl.prototype.onAfterRendering.apply(this, arguments);
		
		var oContent = $(".sapMBtnInner", this.$());
		oContent.html("<span class='sapMBtnContent'>" + this._getText() + "</span>");
		
		return oResult;
	};

	
	Control.prototype._getText = function() {
		return this.getTextB()
			? this.getTextA() + "</span><span class='sapMBtnContent'>" + this.getTextB()
			: this.getTextA();
	};
	
	Control.prototype.init = function () {
		var oResult = BaseControl.prototype.init && BaseControl.prototype.init.apply(this, arguments);
		this.addStyleClass("mvideoButton");
		return oResult;
	};
	//propogate binding to custom anchor bar button
	Control.prototype._buildAnchorBarButton = function(oSectionBase, bIsSection){
		var oButtonClone = BaseControl.prototype._buildAnchorBarButton.apply(this, arguments);
		var oCtx = oSectionBase.getBindingContext();
		if(oCtx){
			oButtonClone.setBindingContext(oCtx);
		}
		return oButtonClone;
	};

	return Control;

}, /* bExport= */ true);



// jQuery.sap.require("sap.m.Button");
// jQuery.sap.require("sap.m.ButtonRenderer");
 
// sap.m.Button.extend("mvideo.cafe.controls.Button", {
//     // the control API:
//     metadata : {
//         properties : {
//         	textA: {type : "string"},
//         	textB: {type : "string"}
//         },
//         aggregations : {
//         },
//         associations: {
//         },
//         events : {
//         }
//     },
//     renderer : render = function(oRm, oButton) {
//     	var sRender = sap.m.ButtonRenderer.render.toString();
//     	var aRender = sRender.split("{");
//     	var sHeader = aRender.shift().match(/\(([^)]+)\)/)[1]; //function arguments
//     	sRender = aRender.join("{").replace(/}[^}]*$/i, "");  // remove last curly bracket and everything after
//     	sRender = sRender.replace( //only one occurrence
// 			'.writeEscaped(',
// 			'.write('
//     	);    	
//     	var myRender = Function(sHeader + ",q", sRender);    	
//     	myRender(oRm, oButton, jQuery);
//     }    
    
// });