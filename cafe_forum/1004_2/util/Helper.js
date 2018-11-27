jQuery.sap.require("mvideo.cafe.util.Mimetype");
jQuery.sap.require("sap.ui.model.Sorter");
jQuery.sap.require("sap.ui.core.HTML");
jQuery.sap.require("sap.ui.core.delegate.ScrollEnablement");
jQuery.sap.require("sap.m.MessageBox");

jQuery.sap.declare("mvideo.cafe.util.Helper");
var me = {
	onNotifications: function(evt){
		var cId = "notifArea",
			bMobile = this.app.hasStyleClass("MVideo_cafe_mobile"),
			oBell = evt.getSource();
		if(!me._notifications){
			if(!$("#" + cId).length){
				var sMainDiv = "<div id='" + cId + "' style='";
				sMainDiv += "height: calc(100% - 3rem); ";
				sMainDiv += "max-width: 20rem; "
					+ "position: absolute; right: 0; top: 3rem;"
					+ "overflow-y: scroll; "
					+ "'></div>";
				this.app.$().append(sMainDiv);
			}
			
			me._notifications = new sap.ui.xmlfragment("mvideo.cafe.view.notifications", this);
			
			//enable drag scrolling
			var oScroller = new sap.ui.core.delegate.ScrollEnablement(me._notifications, null, {
				scrollContainerId: cId,
				horizontal: false,
				vertical: true
			});
			
			this.getView().addDependent(me._notifications);
			
			var fnHideWhenClickedOutside = function(event, sName, bHide) { 
				//close when clicked outside of itself or static area
			    if( !$(event.target).closest("[id^=" + cId + "]").length
		    	&& !$(event.target).closest("#sap-ui-static").length ) {
					console.log(sName +" at: " + event.target.id + ", visible: " + $("#" + cId).is(":visible"));
			    	if($("#" + cId).is(":visible") && bHide) {
			    		console.log("hiding notifications");
			            $("#" + cId).hide();
			        }
			    }        
			};
			setTimeout(function(){
				$(document).click(function(event){ fnHideWhenClickedOutside(event, "Click", true); });
				// $(document).mousedown(function(event){ fnHideWhenClickedOutside(event, "Mousedown", false); });
			}, 200);
			me._notifications.placeAt("notifArea");
	        me._notifications.getBinding("items").sort(new sap.ui.model.Sorter({
	        	path: "",
	        	descending: false,
	        	group: false,
	        	comparator: function(a, b) {
	        		//unread first
	        		if(a.Read && !b.Read){ return 1; }
	        		if(!a.Read && b.Read){ return -1; }
	        		//bigger date first
	        		var delDate = +a.SendDateNum - +b.SendDateNum;
	        		if(delDate){ return -delDate; }
	        		//bigger time first
	        		var delTime = +a.SendTimeNum - +b.SendTimeNum;
	        		if(delTime){ return -delTime; }
	        		return 0;
		        }
	        }));
			me._notifications.attachItemPress(function(evtIP){
				var oList = evtIP.getSource(),
					oCtx = evtIP.getParameter("listItem").getBindingContext(),
					oModel = oCtx.getModel(),
					oData = oCtx.getProperty(oCtx.getPath()),
					odataModel = this.getView().getModel("odata");
				oModel.setProperty(oCtx.getPath() + "/Read", true);
				oBell.getBinding("count").refresh(true);
				oList.getBinding("items").refresh(true); //resort
				oList.setBusy(true);
				//notify backend
				odataModel.callFunction("SetMailRead",{
					urlParameters:{ Id: oData.DocId },
					success: function(data){
						console.log("SetMailRead OK");
					},
					error: function(error){
						console.log("SetMailRead FAIL");
					}
				});
				//get mail content
				odataModel.read("/MailSet",{
					urlParameters: {
						$filter: "DocId eq '" + oData.DocId + "'",
						$select: "Content"
					},
					success: function(data){
						oList.setBusy(false);
						var dialog = new sap.m.Dialog({ //cId + "Dialog",
							title: oData.ObjDescr,
							content: new sap.ui.core.HTML({
								content: "<div>" + data.results[0].Content + "</div>"
							}),
							beginButton: new sap.m.Button({
								text: "Закрыть",
								press: function () {
									dialog.close();
								}
							}),
							afterClose: function() {
								dialog.destroy();
							}
						}).addStyleClass("cafeNotificationDialog");
						dialog.open();
					},
					error: function(error){
						oList.setBusy(false);
					}
				});
			}.bind(this));
		}else{
			setTimeout(function(){
				if($("#" + cId).is(":visible")){
					$("#" + cId).hide();
				}else{
					$("#" + cId).show();
				}
			}, 200);
		}
	},

	
	calculateAge : function(birthDate, todayDate){
		var age = todayDate.getFullYear() - birthDate.getFullYear();

		if( todayDate.getMonth() < birthDate.getMonth() ){
			age--;
		}else if( todayDate.getMonth() === birthDate.getMonth() && todayDate.getDate() < birthDate.getDate() ){
			age--;
		}

		return age;
	},
	
	compensateTimeZone : function(date){
		//only for ABAP D8 type, w/o time!
		if(date.getTimezoneOffset() === 0 //no need
		|| date.getHours() != 0 ){ //already fixed
			return date;
		}
		return new Date(Date.UTC(
			date.getFullYear(),
			date.getMonth(),
			date.getDate()
		));
	},
	
	converMaskToDate: function(str) {
		if (!str) {return "";}
	    var y = str.substr(6,4),
	        m = str.substr(3,2),
	        d = str.substr(0,2);
	    return new Date( Date.UTC(y,m-1,d) );
	},
	
	parseDateYYYYMMDD: function(str){
	    if(!/^(\d){8}$/.test(str)){ return null; }
	    var y = str.substr(0,4),
	        m = str.substr(4,2),
	        d = str.substr(6,2);
	    return new Date( Date.UTC(y,m-1,d) );
	},
	replacePricePlaceHolder : function(text, price, dyn, success) {
		var sPrice = parseInt(price).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1 ");
//		return text.replace('%PRICE%','<b>Стоимость - ' + sPrice + 'р.</b>');
		text = text.replace('<br>%DMS_FILE_BY_PERSA_LITE%', '');
		text = text.replace('<br>%DMS_FILE_BY_PERSA%', '');
		var bDyn = dyn === "true" || dyn === true;
			if(bDyn){
				text = text.replace(/%PRICE%/g, 'от ' + sPrice + 'р.');
			}else{
				text = text.replace(/%PRICE%/g, sPrice + 'р.');
			}
		if (~text.indexOf("MANDT")) {
			var app = sap.ui.getCore().myApp;
			app.getModel("odataMime").callFunction("GetMandt",{
				method: "GET",
				async: true,
				success: function(data) {
					success(text.replace(/%MANDT%/g, data.Short));
				},
				error: function(err) {
					success(text);
				}
			});
		} else {
			success(text);
		}
	},
	replaceFileLinksGW : function(text,success, bMobile, bActive) {
		var oDom = $("<div>" + text + "</div>"); 
		var aTags = oDom.find('[href]');
		if(!aTags || !aTags.length){
			if(success){
				success(text);
			}
			return text;
		}
		
		var aLinks = [];
		aTags.each(function(i,item){
			var sLink = item.getAttribute("href");
			if(sLink.indexOf('http') !== 0){ //simple links
				item.setAttribute("href", "/mockserver/files/" + sLink);
				// if (bMobile && item.className == "mvImg") {
				// 	aLinks.push("files/mobile/" + sLink);
				// } else {
				// 	aLinks.push("files/" + sLink);
				// }
			}
		});
		text = oDom.html();
		if(success){
			success(text);
		}
		return text;
			
		// var app = sap.ui.getCore().myApp;
		// app.getModel("odataMime").callFunction("GetMime",{
		// 	method: "GET",
		// 	async: true,
		// 	urlParameters: {
		// 		url : aLinks.join("//")
		// 	},
		// 	success: function(data,response) {
		// 		console.log("GetMime ok");
				
		// 		aTags.each(function(i,item){
		// 			var oURL = $.grep(data.results, function(e){ 
		// 				if (bMobile && item.className == "mvImg") {
		// 					return e.Short === "files/mobile/" + item.getAttribute("href");
		// 				} else {
		// 					return e.Short === "files/" + item.getAttribute("href");
		// 				}
		// 			});
		// 			if (item.getAttribute("target") !== "_blank") {
		// 				item.setAttribute("target", "_blank");
		// 			}
		// 			if (item.className == "mvActiveLink" && !bActive) {
		// 				$(item).replaceWith([item.innerHTML]);
		// 			} else if(oURL && oURL.length){
		// 				item.setAttribute("href", app.getParent().addProxy(oURL[0].Full));
		// 			}
		// 		});				
		// 		text = oDom.html();
		// 		if(success){
		// 			success(text);
		// 		}
		// 		return text;
		// 	}
		// });
	},
	
	replaceImgScrLinks : function(text, success, bMobile) {
		var oDom = $("<div>" + text + "</div>"); 
		var aTags = oDom.find('[src]');
		if(!aTags || !aTags.length){
			if(success){
				success(text);
			}
			return text;
		}
		var aImgs = [];
		aTags.each(function(i,item){
			var sImg = item.getAttribute("src");
			if(sImg.indexOf('http') !== 0){ //simple links
			//	aImgs.push("img/" + sImg);
				aImgs.push("files/" + sImg);
			}
		});
			
		var app = sap.ui.getCore().myApp;
		app.getModel("odataMime").callFunction("GetMime",{
			method: "GET",
			async: true,
			urlParameters: {
				url : aImgs.join("//")
			},
			success: function(data,response) {
				console.log("GetMime ok");
				
				aTags.each(function(i,item){
					var oURL = $.grep(data.results, function(e){
					//	return e.Short === "img/" + item.getAttribute("src");
						return e.Short === "files/" + item.getAttribute("src");
					});
					if(oURL && oURL.length){
						item.setAttribute("src", app.getParent().addProxy(oURL[0].Full));
					}
				});				
				text = oDom.html();
				if(success){
					success(text);
				}
				return text;
			}
		});
	},
	
	deleteDublicates : function(array) {
		var seen = {};
		var out = [];
		var len = array.length;
		var j = 0;
		for (var i = 0; i < len; i++) {
			var item = array[i];
			if (seen[item] !== 1) {
				seen[item] = 1;
				out[j++] = item;
			}
		}
		return out;
	},
	
	getODataFieldType : function(odata, entity, property){
		var aEntityType = odata.getServiceMetadata().dataServices.schema[0].entityType;
		var oEntityType = $.grep(aEntityType, function(e){ return e.name == entity; });
		oEntityType = oEntityType && oEntityType[0];
		var oPropertyType = $.grep(oEntityType.property, function(e){ return e.name == property; }); 
		return oPropertyType && oPropertyType[0];
	},
	
	getODataRelativeURI : function(uri, odataModel){
		var namespace = odataModel.getServiceMetadata().dataServices.schema[0].namespace;
		var sUri = uri.split(namespace).pop().split("mockserver/").pop();
		
		return sUri;
	},
	
	getODataDeferredURI : function(uri, odataModel){
		return me.getODataRelativeURI(uri.__deferred.uri, odataModel);
	},
	
	_setYear: function(year, uri) {
		return uri.replace("Year='0000'", "Year='" + year + "'");
	},
	
	getODataErrorMessage : function(error){
		if(error && error.response && error.response.body){
			var aError = error.response.body.match(/<message[^>]+>([^<]+)<\/message>/);
			//var aError = error.response.body.match(/<message[^>]*>(.*)<\/message>/i);
		}
		if(aError){
			return aError[1];
		}
	},
	
	groupStep2Fields : function(fields, oLocal){
		oLocal.setProperty("/step2/fields", fields);
		
		var oGroups = {};
		var aGroups = [];
		fields.forEach(function(field){
			if(!oGroups[field.Grouptext]){
				oGroups[field.Grouptext] = [];
			}
			oGroups[field.Grouptext].push(field);
		});
		for ( var group in oGroups) {
			aGroups.push({
				name: group,
				fields: oGroups[group]
			});
		}
		oLocal.setProperty("/step2/fieldGroups", aGroups);
		
	},
	
	getOSVersion: function() {
		 var oDeviceModel = new sap.ui.model.json.JSONModel(sap.ui.Device);	
		 return oDeviceModel.getProperty("/os/OS/name");
	},
	
	getIEVersion : function() {
		var sAgent = window.navigator.userAgent;
		//sap.m.MessageBox.show(sAgent, { title: "userAgent" }); // DEV ONLY
		
		if(sAgent.match(/sap.?fiori.?client/i)){
			return "fiori";
		}

		var Idx = sAgent.indexOf("MSIE");
		// If IE, return version number.
		if (Idx > 0){
			return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));
		// If IE 11 then look for Updated user agent string.
		} else if (navigator.userAgent.match(/Trident\/7\./)){
			return 11;
		} else {
			return 0; // It is not IE
		}
	},
	
	b64toBlob : function(b64Data, contentType, sliceSize) {
	    contentType = contentType || "";
	    sliceSize = sliceSize || 512;

	    var byteCharacters = atob(b64Data);
	    var byteArrays = [];

	    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
	        var slice = byteCharacters.slice(offset, offset + sliceSize);

	        var byteNumbers = new Array(slice.length);
	        for (var i = 0; i < slice.length; i++) {
	            byteNumbers[i] = slice.charCodeAt(i);
	        }

	        var byteArray = new Uint8Array(byteNumbers);
	        byteArrays.push(byteArray);
	    }

	    var blob = new Blob(byteArrays, {type: contentType});
	    return blob;
	},
	
	
	downloadBase64 : function(base64, name, extension){
		return me.downloadCommon(base64, null, name, extension);
	},
	downloadURI : function(uri, name, extension){
		return me.downloadCommon(null, uri, name, extension);
	},
	downloadCommon : function(base64, uri, name, extension){
		console.log("TOZ downloadCommon start");
		var sFileName = (extension) ? name + "." + extension : name;
		console.log("TOZ sFileName: " + sFileName);
		var sURI = (window.location.hostname === "localhost") ? "/MVideo_2/proxy" + uri : uri; 
		var mimetype = window.MimeType.lookup( sFileName );
		console.log("TOZ mimetype: " + mimetype);
		var ieVersion = me.getIEVersion();
		console.log("TOZ ieVersion: " + ieVersion);
		console.log("TOZ base64: " + !!base64);
		var osVersion = me.getOSVersion();
		if (ieVersion === "fiori" || osVersion === "ios" || osVersion === "iOS") {//SAP Fiori Client
			if(base64){
				me.downloadFioriBase64(base64, mimetype, sFileName);
			}else{
		        window.open(sURI, "_blank");
			}
		} else if (ieVersion > 0){
			if (ieVersion === 11){ //for IE11
				if(base64){
					var oBlob = me.b64toBlob(base64,mimetype);
					window.navigator.msSaveOrOpenBlob(oBlob, sFileName);
				}else{
			        window.open(sURI, "_blank");
				}
			}
		}else{ //normal browser
			var downloadLink = document.createElement("a");
			if(base64){
				downloadLink.href = "data:" + mimetype + ";base64," + base64;
			}else{
				downloadLink.href = sURI;
			}
			downloadLink.download = sFileName;
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
		}
	},
	
	downloadFioriBase64: function(base64, mimetype, sFileName){
		// sap.m.MessageBox.show((window.requestFileSystem || "").toString(), { title: "requestFileSystem" }); // DEV ONLY
		// sap.m.MessageBox.show((window.LocalFileSystem || "").toString(), { title: "LocalFileSystem" }); // DEV ONLY
		var sURI = "data:" + mimetype + ";base64," + base64;
		window.open(sURI, "_blank");
	},
	
	printBase64 : function(base64, name, extension){
		return me.printCommon(base64, null, name, extension);
	},
	printURI : function(uri, name, extension){
		return me.printCommon(null, uri, name, extension);
	},
	printCommon : function(base64, uri, name, extension){
		var sFileName = (extension) ? name + "." + extension : name;
		var sURI = (window.location.hostname === "localhost") ? "/MVideo_2/proxy" + uri : uri; 
		var mimetype = window.MimeType.lookup( sFileName );
		var ieVersion = me.Helper.getIEVersion();
		if (ieVersion > 0){
			if (ieVersion === 11){ //for IE11
				if(base64){
					var oBlob = me.b64toBlob(base64,mimetype);
					window.navigator.msSaveOrOpenBlob(oBlob, sFileName);
				}else{
				    var w = window.open(sURI, "_blank");
				    w.onload = function(){
						w.print();
						setTimeout(function(){
							window.close();
						}, 1);
			    	};
				}
			}
		}else{ //normal browser
			if(base64){
				var downloadLink = document.createElement("a");
				downloadLink.href = "data:" + mimetype + ";base64," + base64;
				downloadLink.download = sFileName;
				document.body.appendChild(downloadLink);
				downloadLink.click();
				document.body.removeChild(downloadLink);
			}else{
		        var w2 = window.open(sURI,"_self");
		        w2.print();
		        w2.close();
			}
		}
	},
	
	msgToArray: function(sTxt) {
		var c = sTxt[0], aTxt = sTxt.split(c);
		aTxt.shift();
		return aTxt;
	},
	
	MimeType: mvideo.cafe.util.Mimetype
};
mvideo.cafe.util.Helper = me;