/* 
 * Double line text on Button
 */


jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.m.ButtonRenderer");
 
sap.m.Button.extend("evola.controls.Button", {
    // the control API:
    metadata : {
        properties : {
        	textA: {type : "string"},
        	textB: {type : "string"},
        },
        aggregations : {
        },
        associations: {
        },
        events : {
        }
    },
});

evola.controls.Button.prototype.setText = function () {
	arguments[0] += 'x';
	sap.m.Button.prototype.setText.apply(this, arguments);
};

evola.controls.Button.prototype._getText = function() {
	if(this.getTextA() && this.getTextB())
		return this.getTextA() + '</span><span class="sapMBtnContent">' + this.getTextB();
	else if(this.getTextA())
		return this.getTextA();
	else if(this.getTextB())
		return this.getTextB();
	else
		return this.getText();
};

evola.controls.Button.prototype.init = function () {
	//check super method and execute if exist
	var upper = sap.m.Button.prototype.init;
	if(upper) upper.apply(this, arguments);
	//add custom style class
	this.addStyleClass("evolaButton")	
};