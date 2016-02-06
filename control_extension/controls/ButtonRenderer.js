sap.ui.define(['jquery.sap.global', 'sap/m/ButtonRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ButtonRenderer, Renderer) {
	"use strict";

	var evolaButtonRenderer = Renderer.extend(ButtonRenderer);
	
	//directly rewrite the source code of super method
	var sRender = evolaButtonRenderer._super.render.toString();
	var aRender = sRender.split("{");
	var sHeader = aRender.shift().match(/\(([^)]+)\)/)[1]; //function arguments
	sRender = aRender.join("{").replace(/}[^}]*$/i, "");  // remove last curly bracket and everything after
	sRender = sRender.replace( //only one occurrence
		'.writeEscaped(',
		'.write('
	);    	
	var myRender = Function(sHeader + ",q", sRender);
	evolaButtonRenderer.render = function(oRm, oButton)	{
		myRender.apply(this, [oRm, oButton, jQuery]);
	};	
	
	//use predefined hook
	evolaButtonRenderer.renderButtonAttributes = function(oRm, oButton) {
		oRm.addStyle("height", "initial");
		oRm.writeStyles();
	};

	return evolaButtonRenderer;

}, /* bExport= */ true);
