jQuery.sap.require("sap.m.Dialog");
jQuery.sap.require("sap.m.DialogRenderer");
 
sap.m.Dialog.extend("mvideo.cafe.controls.Dialog", {
    // the control API:
    metadata : {
        properties : {
        },
        aggregations : {
        },
        associations: {
        },
        events : {
        }
    },
             
    renderer : {}
});

mvideo.cafe.controls.Dialog.prototype._processButton = function(oButton){
	var that = this;
	if (!this._oButtonDelegate) {
		this._oButtonDelegate = {
			ontap: function(){
				that._oCloseTrigger = this;
			}
		};
	}
	if (oButton) {
		oButton.addDelegate(this._oButtonDelegate, true, oButton);
//		if ( !(oButton.getType() === sap.m.ButtonType.Accept || oButton.getType() === sap.m.ButtonType.Reject)) {
//			oButton.setType(sap.m.ButtonType.Transparent);
//		}
	}
};