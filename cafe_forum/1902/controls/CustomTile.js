jQuery.sap.require("sap.m.CustomTileRenderer");
jQuery.sap.require("sap.m.CustomTile");
 
sap.m.CustomTile.extend("mvideo.cafe.controls.CustomTile", {
    // the control API:
    metadata : {
        properties : {
        	myEnabled: {type : "boolean", defaultValue : true}
        },
        aggregations : {
        },
        associations: {
        },
        events : {
        }
    },
             
    renderer : render = function(oRm, oControl) {
//    	/*TEMP*/ console.log( oControl.getContent().getItems()[0].getItems()[1].getText() + ": rerender");
    	
    	if (oControl.getMyEnabled()) {
    		sap.m.CustomTileRenderer.render.apply(this,[oRm, oControl]);
		} else { //wrap disabled and a overlay neighbor
	    	oRm.write("<div");
	    	oRm.writeAttribute("style","display: inline-block; position: relative;");
	    	oRm.write(">");
		    	sap.m.CustomTileRenderer.render.apply(this,[oRm, oControl]);
				oRm.write("<div");
				oRm.writeAttribute("style",
					"display: inline-block; " +
					"z-index: 1; " +
					"position: absolute; " +
					"top: 0px; " +
					"left: 0px; " +
					"width: 100%; " +
					"height: 100%; " +
					"opacity: 0.7; " +
					"background-color: white;"
				);
				oRm.write(">");
				oRm.write("</div>");
			oRm.write("</div>");
		}
    }
});

mvideo.cafe.controls.CustomTile.prototype.setMyEnabled = function(sNew) {
//	/*TEMP*/ console.log( this.getContent().getItems()[0].getItems()[1].getText() + ": setMyEnabled - " + sNew);
//	sap.ui.core.Control.prototype.setProperty.apply(this, ["myEnabled", sNew, true]);
	this.setProperty("myEnabled", sNew, true);
	this.getParent() && this.getParent().rerender();	
}