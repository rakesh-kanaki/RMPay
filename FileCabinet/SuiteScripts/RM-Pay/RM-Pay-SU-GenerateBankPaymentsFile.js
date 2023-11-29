/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/currency', 'N/currentRecord', 'N/dataset', 'N/error', 'N/file', 'N/log', 'N/record', 'N/render', 'N/search', 'N/xml', './Lib/RMPay_common_lib'],
    /**
 * @param{currency} currency
 * @param{currentRecord} currentRecord
 * @param{dataset} dataset
 * @param{error} error
 * @param{file} file
 * @param{log} log
 * @param{record} record
 * @param{render} render
 * @param{search} search
 * @param{xml} xml
 */
    (currency, currentRecord, dataset, error, file, log, record, render, search, xml,rmPayLib) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        // const onRequest = (scriptContext) => {
        //     if (context.request.method === "GET") {
        //         //var subsidTiary = context.request.parameters.custpage_subsidiary;
        //         var templateId = '13277';
        //         var bankPaymentJsonFile = '12065';
        //     }

        // }
        function onRequest(context) {
            if (context.request.method === 'GET') {
                var templateId = '13172';
                var bankPaymentJsonFile = '12065';

                if (rmPayLib._validateData(templateId)) {
					var templateFile = file.load({
						id: templateId
					});
					// log.debug({
					// 	title: 'templateFile',
					// 	details: templateFile
					// });
                    var templateContent = extractFileContent(templateFile.getContents(),true);
					// log.debug({
					// 	title: 'templateContent',
					// 	details: JSON.stringify(templateContent)
					// });
                    if (rmPayLib._validateData(bankPaymentJsonFile)) {
                        var JSONDataObj = file.load({
                            id: bankPaymentJsonFile
                        });
                        // log.debug({
                        //     title: 'JSONDataObj',
                        //     details: JSONDataObj
                        // });
                        var JSONData = JSONDataObj.getContents();
                        log.debug({
                            title: 'JSONData',
                            details: JSON.stringify(JSONData)
                        });
                        var PaymentContent = _mergexmlAndJson(templateContent,JSONData);

                        var folderId = 689; // Replace with the actual folder ID.

                        // Create a new file in the specified folder.
                        var newFile = file.create({
                            name: 'MyNewFile.xml', // Replace with your desired file name.
                            fileType: file.Type.XMLDOC,
                            contents: PaymentContent, // Replace with your desired file content.
                            folder: folderId
                        });

                        // Save the file to NetSuite.
                        var fileId = newFile.save();
                    }
                }
            }
        }
        function _StringToXML(xmlString) {
            //var parser = new DOMParser();
            //var xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            var xmlDoc = xml.Parser.fromString({ text: xmlString });
            return xmlDoc;
        }
        function isObject(jsonValue) {
            return typeof jsonValue === 'object' && jsonValue !== null && !Array.isArray(jsonValue);
          }
        function _mergexmlAndJson(xmldata,jsondata) {
            // var xmlobject = _StringToXML(xmldata);
            
            jsondata = JSON.parse(jsondata);
            var currentDate  = new Date();

            jsondata["system.date"] = rmPayLib.parseAndFormatDateString(currentDate)[1];

            xmldata = replaceValuesintemplate(jsondata,xmldata);
            log.debug({
                title: '_mergexmlAndJson | xmlobject',
                details: JSON.stringify(xmldata)
            });
            return xmldata;
        }
        function replaceValuesintemplate(jsondata,xmldata) {
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
                            xmldata = replaceValuesintemplate(value,xmldata)
                        }
                        if(key == "trandetails") {                            
                            xmldata = replaceloopValuesintemplate(value,xmldata)
                        }
                        
                    } else {
                        var placeholder = '${' + key + '}';
                        xmldata = xmldata.replaceAll(placeholder,value);
                    }
                }
            }
            return xmldata;
        }
        function replaceloopValuesintemplate(jsondata,xmldata) {
            
            var loopingXml = extractReturnContent(xmldata);
            log.debug({
                title: 'replaceloopValuesintemplate',
                details: JSON.stringify(loopingXml)
            });
            var loopData = _getloopXmlData(jsondata,loopingXml);

            xmldata = xmldata.replaceAll(loopingXml,loopData);

            return xmldata;
        }
        function _getloopXmlData(jsondata,xmlstr) {
            var tempdata = xmlstr;
            for(var d=0;d< jsondata.length;d++) {
                if(d==0) {
                    xmlstr = replaceValuesintemplate(jsondata[d],tempdata)
                } else {
                    xmlstr = xmlstr + replaceValuesintemplate(jsondata[d],tempdata)
                }
                
            }
            log.debug({
                title: 'xmlstr',
                details: JSON.stringify(xmlstr)
            });
            return xmlstr;
        }
        function extractReturnContent(rawContent) {
            var returnContent = rawContent.substring(rawContent.indexOf("<!--start of Loop-->") + "<!--start of Loop-->".length);
            returnContent = returnContent.trim();
            var EndOfLoop = returnContent.indexOf("<!--End of Loop-->");
            returnContent = returnContent.substring(0, EndOfLoop);
    
            return returnContent;
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
        return {onRequest}

    });
