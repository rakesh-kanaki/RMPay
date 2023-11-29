/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/render', 'N/search', 'N/record', 'N/xml', './Lib/RMPay_common_lib'],
	function (file, render, search, record, xml, rmPayLib) {

		function execute(context) {
			//var templateId = '13172';
			var searchPayementJson = searchJsonFile();
			var currencyList = rmPayLib._getActiveCurrencyList();
			
			//for (var i = 0; i < searchPayementJson.length; i++) {
			for (var i = 0; i < 1; i++) {
				var internalId = searchPayementJson[i].getValue({ name: 'internalid', sort: search.Sort.ASC });
				var templateFloder = searchPayementJson[i].getValue({ name: 'custrecord_rmpay_cbd_folder_id_pf', join: 'CUSTRECORD_RMPAY_PP_COMPANY_BANK_DETAIL' });
				var templateId = searchPayementJson[i].getValue({ name: 'custrecord_rmpay_cbd_pay_file_format', join: 'CUSTRECORD_RMPAY_PP_COMPANY_BANK_DETAIL' });
				var PaymentFloder = searchPayementJson[i].getValue({ name: 'custrecord_rmpay_cbd_folder_id_pd', join: 'CUSTRECORD_RMPAY_PP_COMPANY_BANK_DETAIL' });
				var bankPaymentFile = searchPayementJson[i].getValue({ name: 'custrecord_rmpay_pp_payment_file_link' });
				var bankPaymentJsonFile = searchPayementJson[i].getValue({ name: 'custrecord_rmpay_pp_payment_data' });
				
				log.debug({title: 'templateId',	details: templateId});
				
	
				
				if (rmPayLib._validateData(templateId)) {
					var templateFile = file.load({id: templateId});
					log.debug({title: 'templateFile',details: templateFile});
					var templateContent = templateFile.getContents();
					log.debug({title: 'templateContent',details: JSON.stringify(templateContent)});
					if (rmPayLib._validateData(bankPaymentJsonFile)) {
						var JSONData = file.load({id: bankPaymentJsonFile}).getContents();
						log.debug({title: 'JSONData',details: JSON.stringify(JSONData)});
						if (rmPayLib._validateData(JSONData)) {
							// here we have both template content & JSON content.
							log.debug({
								title: 'execute | currencyList',
								details: JSON.stringify(currencyList)
							})
							var PaymentContent = _mergexmlAndJson(templateContent,JSONData,currencyList);

							var fileName = _getBankPaymentFileName(JSONData);
							log.debug({title: 'fileName',details: fileName});
							if(rmPayLib._validateData(PaymentContent) && rmPayLib._validateData(fileName)) {
								var newFile = file.create({	name: fileName, fileType: file.Type.XMLDOC,	contents: PaymentContent,folder: PaymentFloder});
								var fileId = newFile.save();
								log.debug({title: 'fileId',	details: fileId});
								log.debug({title: 'internalId',	details: internalId});
								// record.attach({
								// 	RECORD:{
								// 		type:'file',
								// 		id:fileId
								// 	},
								// 	to:{
								// 		type:'customrecord_rmpay_payment_proposal', 
								// 		id:internalId
								// 	}
								// });
								
								//log.debug({title: 'internalId',	details: internalId});
								record.submitFields({
									type: 'customrecord_rmpay_payment_proposal',
									id:internalId,
									values: {
										custrecord_rmpay_pp_payment_file_link: fileId
									 },
							  });
							}
						}
					}
				}
			}
		}
		function _getBankPaymentFileName(jsondata) {
			jsondata = JSON.parse(jsondata);
			return "BankPaymentsFile_"+ jsondata["proposalid"]+".xml"
		}
		function _mergexmlAndJson(xmldata,jsondata, currencyList) {            
            jsondata = JSON.parse(jsondata);
            var currentDate  = new Date();

            jsondata["system.date"] = rmPayLib.parseAndFormatDateString(currentDate)[1];

			log.audit({
				title: '_mergexmlAndJson | currencyList',
				details: JSON.stringify(currencyList)
			})
			// var xmlStringContent = xml.Parser.toString({
			// 	document : xmldata
			// });

            xmldata = replaceValuesintemplate(jsondata,xmldata, currencyList);
            log.debug({
                title: '_mergexmlAndJson | xmlobject',
                details: JSON.stringify(xmldata)
            });
            return xmldata;
        }
		function replaceValuesintemplate(jsondata,xmldata,currencyList) {
			xmldata = xmldata.toString();
			log.audit({
				title: 'replaceValuesintemplate| currencyList',
				details: JSON.stringify(currencyList)
			})
            for(key in jsondata) {
                if (jsondata.hasOwnProperty(key)) {
                    var value = jsondata[key];
                        if(typeof(value) === 'object') {
                        // this is object.
                        log.debug({
                            title: 'key:'+key,
                            details: 'value:'+JSON.stringify(value)
                        });
                        
                        if(key == "subsidiary") {
                            xmldata = replaceValuesintemplate(value,xmldata,currencyList)
                        }
                        if(key == "trandetails") {                            
                            xmldata = replaceloopValuesintemplate(value,xmldata,currencyList)
                        }
                        
                    } else {
                        var placeholder = '${' + key + '}';
						if(key == "trandetails.ReqdExctnDt") {
							value = rmPayLib.parseAndFormatDateString(value)[1];
						}
						if(key == "trandetails.BillCurrency") {
							//value = currencyList[value];
							
						}
						do {
							xmldata = xmldata.replace(placeholder,value);
						}while(xmldata.indexOf(placeholder) > -1);
                    }
                }
            }
            return xmldata;
        }
		function replaceloopValuesintemplate(jsondata,xmldata,currencyList) {            
            var loopingXml = extractLoopingContent(xmldata).toString();
            var loopData = _getloopXmlData(jsondata,loopingXml);
            xmldata = xmldata.replace(loopingXml,loopData);
            return xmldata;
        }
		function extractFileContent(rawContent, isNotXML) {
            var formattedFileContent = rawContent;
            if (isNotXML) {
                formattedFileContent = formattedFileContent.replace(/&amp;/g, "&");
                formattedFileContent = formattedFileContent.replace(/&AMP;/g, "&");
                formattedFileContent = formattedFileContent.replace(/\t/g,'');
                formattedFileContent = formattedFileContent.replace(/\n/g,'');
                formattedFileContent = formattedFileContent.replace(/\r/g,'');
                formattedFileContent = formattedFileContent.replace(/\t\t\t\t\t\t\r\n/g,'');
                formattedFileContent = formattedFileContent.replace(/\t\t\t\t\t/g,'');
            }
            formattedFileContent = formattedFileContent.replace(/\&apos;/g, '\'');
    
            return removeLineBreaks(formattedFileContent);
        }
        function removeLineBreaks(xmlString) {
            // Use a regular expression to replace \r\n with an empty string
            return xmlString.replace(/\r\n/g, '');
        }
		function _getloopXmlData(jsondata,xmlstr,currencyList) {
            var tempdata = xmlstr;
            for(var d=0;d< jsondata.length;d++) {
                if(d==0) {
                    xmlstr = replaceValuesintemplate(jsondata[d],tempdata,currencyList)
                } else {
                    xmlstr = xmlstr + replaceValuesintemplate(jsondata[d],tempdata,currencyList)
                }                
            }
            log.debug({
                title: 'xmlstr',
                details: JSON.stringify(xmlstr)
            });
            return xmlstr;
        }
		function extractLoopingContent(rawContent) {
            var returnContent = rawContent.substring(rawContent.indexOf("<!--start of Loop-->") + "<!--start of Loop-->".length);
            returnContent = returnContent.trim();
            var EndOfLoop = returnContent.indexOf("<!--End of Loop-->");
            returnContent = returnContent.substring(0, EndOfLoop);
    
            return returnContent;
        }
		function searchJsonFile() {
			var fx = 'searchJsonFile';
			try {
				var customrecord_rmpay_payment_proposalSearchObj = search.create({
					type: "customrecord_rmpay_payment_proposal",
					filters:
						[
							["formulatext: {custrecord_rmpay_pp_payment_data}", "isnotempty", ""],
							"AND",
							["formulatext: {custrecord_rmpay_pp_payment_file_link}", "isempty", ""]
						],
					columns:
						[
							search.createColumn({
								name: "internalid",
								sort: search.Sort.ASC,
								label: "Internal ID"
							}),
							search.createColumn({
								name: "custrecord_rmpay_cbd_folder_id_pf",
								join: "CUSTRECORD_RMPAY_PP_COMPANY_BANK_DETAIL",
								label: "Folder ID - Payment Files"
							}),
							search.createColumn({
								name: "custrecord_rmpay_cbd_pay_file_format",
								join: "CUSTRECORD_RMPAY_PP_COMPANY_BANK_DETAIL",
								label: "Payment Files Format"
							}),
							search.createColumn({
								name: "custrecord_rmpay_cbd_folder_id_pd",
								join: "CUSTRECORD_RMPAY_PP_COMPANY_BANK_DETAIL",
								label: "Payment Files Folder"
							}),
							search.createColumn({ name: "custrecord_rmpay_pp_payment_file_link", label: "Bank Payment File" }),
							search.createColumn({ name: "custrecord_rmpay_pp_payment_data", label: "Bank payment Json File" })
						]
				});

				var searchResult = customrecord_rmpay_payment_proposalSearchObj.run().getRange({ start: 0, end: 1000 });
				return searchResult != null && searchResult.length > 0 ? searchResult : null;

			}
			catch (e) {
				log.debug(fx, 'Error == ' + e);
			}
		}

		return {
			execute: execute
		};

	});
