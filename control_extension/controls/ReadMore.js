/*
 * Expandable text
 */

sap.ui.define(['jquery.sap.global', 'sap/m/Text'],
	function(jQuery, Text) {
	"use strict";
	
	var ReadMore = Text.extend("evola.controls.ReadMore", /** @lends sap.m.Text.prototype */{
		metadata : {
			properties: {
				expanded : {type : "boolean", defaultValue : false},
			},
			events: {
				press: {}
			}
		},
		renderer : {}
	});
	
	ReadMore.prototype.getClampHeight = function(oDomRef){
		oDomRef = oDomRef || this.getTextDomRef();
		return this.getExpanded()
			? oDomRef.scrollHeight
			: this.getMaxLines() * this.getLineHeight(oDomRef);
	};
	
	ReadMore.prototype.canUseNativeLineClamp = function(){
		return false;
	};
	
	ReadMore.prototype.clampHeight = function(){
		this.clampText();
		
//		this.rerender(); 
		return;
		
		var oDomRef = this.getTextDomRef(); 
		//remove one more character before ellipsis
		if( !this.getExpanded() && oDomRef.scrollHeight > this.getClampHeight() ){			
			oDomRef.innerText = oDomRef.innerText.slice(0,-(this.ellipsis.length + 1)) + this.ellipsis;
		}
	};
	
	ReadMore.prototype.onclick = function(oEvent) {
		this.setExpanded(
			!this.getExpanded()	
		);
		this.rerender();
	};
	
	ReadMore.prototype.onAfterRendering = function(oEvent) {
		Text.prototype.onAfterRendering.apply(this, arguments);
		
		var that = this;
		if(this.deferredRender){
			this.deferredRender = false;
			setTimeout(function(){
				that.rerender();
//				console.log("deferredRender " + that.getId());
			}, 0);
		}
	};
	
	ReadMore.prototype.init = function() {
		if(Text.prototype.init)
			Text.prototype.init.apply(this, arguments);
		this.deferredRender = true;		
	};
	
	ReadMore.prototype.deferredRender;
	
});