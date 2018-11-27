jQuery.sap.require("mvideo.cafe.util.Mimetype");
jQuery.sap.require("sap.ui.unified.FileUploader");
jQuery.sap.require("sap.ui.unified.FileUploaderParameter");
jQuery.sap.require("sap.m.MessageToast");

sap.ui.define(['jquery.sap.global', 'sap/ui/unified/FileUploader',
       'sap/ui/unified/FileUploaderParameter', 'sap/m/MessageToast'],
	function(jQuery, FU, FUParam, MT) {
	"use strict";
	
	var FileUploader = FU.extend("mvideo.cafe.controls.FileUploader", {
		// the control API:
		metadata : {
			properties : {
				token   : { type : "string" },
				techkey : { type : "string" },
				friendlyName : { type : "string" }
			},
			aggregations : {},
			associations : {},
			events : {
				getToken : {},
				myUploadFail : {}
			}
		},
		renderer : {}
	});

	FileUploader.prototype.upload = function() {
		console.log("Upload!!")
		
		if(!MimeType.lookup(this.getValue())){
			//unknown file extension
			// MT.show( 'Неизвестное расширение файла!' );
			MT.show( URI.decode('%D0%9D%D0%B5%D0%B8%D0%B7%D0%B2%D0%B5%D1%81%D1%82%D0'
					+ '%BD%D0%BE%D0%B5%20%D1%80%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD'
					+ '%D0%B8%D0%B5%20%D1%84%D0%B0%D0%B9%D0%BB%D0%B0%21') );
			this.fireMyUploadFail();
			return;
		}

		this.fireGetToken();
		this.removeAllHeaderParameters();
		this.addHeaderParameter(new FUParam({
			name  : "x-csrf-token",
			value : this.getToken()
		}));
		
		var sFilename = this.getTechkey()
			+ '&' + URI.encode( this.getValue() )
			+ '&' + URI.encode( this.getFriendlyName() );
		
		this.addHeaderParameter(new FUParam({
			name  : "slug",
			value : sFilename
		}));
		
		return FU.prototype.upload.apply(this, []);
	};

});