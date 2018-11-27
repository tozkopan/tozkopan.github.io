sap.ui.define([
	"sap/m/Button"
], function(BaseControl) {
	"use strict";

	var Control = BaseControl.extend("mvideo.cafe.controls.BellButton", {
		metadata: {
			properties: {
				shakeInterval: { type: "string", defaultValue: 100 },
				shakeLongInterval: { type: "string", defaultValue: 4000 },
				shakeDistance: { type: "string", defaultValue: 5 },
				shakeTimes: { type: "string", defaultValue: 4 },
				count: { type: "string" }
			}
		},
		renderer: { }
	});
	
	Control.prototype.onmouseover = function() {
		clearInterval(this._shakeRepeater);
		delete this._shakeRepeater;
	};

	Control.prototype.shake = function() {
		var interval = +this.getShakeInterval(),
			distance = +this.getShakeDistance(),
			times = +this.getShakeTimes(),
			oDom = this.$();

		oDom.css("position", "relative");
		for (var iter = 0; iter < (times + 1); iter++) {
			oDom.animate({
				left: ((iter % 2 === 0 ? distance : distance * -1))
			}, interval);
		}
		oDom.animate({
			left: 0
		}, interval);
	};
	
	Control.prototype.onAfterRendering = function() {
		var oResult = BaseControl.prototype.onAfterRendering && BaseControl.prototype.onAfterRendering.apply(this, arguments);
		this._renderCount();
		return oResult;
	};
	
	Control.prototype.setCount = function(value) {
		var oldValue = +this.getCount();
		if(+value > oldValue){
			if(!this._shakeRepeater){
				this._shakeRepeater = setInterval(
					this.shake.bind(this),
					+this.getShakeLongInterval()
				);
			}
		}
		var oResult = BaseControl.prototype.setProperty.call(this, "count", +value || "");
		this._renderCount();
		return oResult;
	};
	
	Control.prototype._renderCount = function() {
		$(".sapMBtnIcon", this.$()).attr("data-sap-ui-bellbutton-content", this.getCount());
	};
	
	Control.prototype.init = function() {
		var oResult = BaseControl.prototype.init && BaseControl.prototype.init.apply(this, arguments);
		this.addStyleClass("mvideoBellButton");
		return oResult;
	};
	
	return Control;

}, /* bExport= */ true);