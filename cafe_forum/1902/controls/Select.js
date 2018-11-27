jQuery.sap.require("sap.m.Select");
 
sap.m.Select.extend("mvideo.cafe.controls.Select", {
    // the control API:
    metadata : {
        properties : {
        	valueState: { type: "sap.ui.core.ValueState", defaultValue: sap.ui.core.ValueState.None },
        	iconText: { type: "string" },
        },
        aggregations : {
        },
        associations: {
        },
        events : {
        }
    },
             
    renderer : render = function(oRm, oControl) {
    	var oOriginal = jQuery.extend(true, {}, sap.m.SelectRenderer );
    	var iconText = oControl.getIconText(); 
    	if(iconText){
    		oOriginal.renderIcon = function(oRm, oSelect){
				oRm.write('<span class="' + this.CSS_CLASS + 'Icon"');
				oRm.writeAttribute("id", oSelect.getId() + "-icon");
				oRm.write(">" + iconText + "</span>")
    		}
    	}
//    	oOriginal.render.apply(this,[oRm, oControl]);
    	oOriginal.render(oRm, oControl);
    }
    
});

mvideo.cafe.controls.Select.prototype.setValueState = function(sNew) {
	var sOld = this.getValueState();
	sap.ui.core.Control.prototype.setProperty.apply(this, ["valueState", sNew, true]);
	
	var mValueState = sap.ui.core.ValueState,
		$This = this.$();

	if (sOld !== mValueState.None) {
		$This.removeClass("mySelectState" + sOld);
	}
	if (sNew !== mValueState.None) {
		$This.addClass("mySelectState" + sNew);
	}
};