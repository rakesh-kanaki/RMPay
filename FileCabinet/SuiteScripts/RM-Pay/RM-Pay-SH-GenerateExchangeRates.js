/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/currency', 'N/currentRecord', 'N/error', 'N/http', 'N/https', 'N/log', 'N/record', 'N/search', './Lib/RMPay_common_lib'],
    /**
 * @param{currency} currency
 * @param{currentRecord} currentRecord
 * @param{error} error
 * @param{http} http
 * @param{https} https
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (currency, currentRecord, error, http, https, log, record, search, rmlib) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            var currencyColumns = [];
            currencyColumns.push(search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Name" }));
            currencyColumns.push(search.createColumn({ name: "symbol", label: "Symbol" }));
            currencyColumns.push(search.createColumn({ name: "internalid", label: "Internal ID" }));

            var currencyList = rmlib._getCurrencyList(currencyColumns, 'currency');
            log.debug("currencyList", JSON.stringify(currencyList))

            var rmpay_company_bank_detailsSearchColAccountCurrency = [];
            rmpay_company_bank_detailsSearchColAccountCurrency.push(search.createColumn({ name: 'custrecord_rmpay_cbd_currency', summary: search.Summary.GROUP }));
            var bankCurrencyList = rmlib._getBankCurrencyList(rmpay_company_bank_detailsSearchColAccountCurrency, 'customrecord_rmpay_company_bank_details');//['NOK', 'EUR'];//rmlib._getCurrencyExchangeRate('NOK');//rmlib._getBankCurrencyList();
            log.debug("bankCurrencyList", JSON.stringify(bankCurrencyList))
            var ExchangeRateData = {};
            var NSCurrencyMapping = {};

            var CurrentExchangeRecord = rmlib._getCurrentExchangeRecord();
            log.debug("CurrentExchangeRecord", CurrentExchangeRecord)
            var CurrentExchangeRecordObj;
            if (rmlib._validateData(CurrentExchangeRecord)) {
                // Logic of Record already created for today.
                CurrentExchangeRecordObj = record.load({
                    type: 'customrecord_rmpay_currexchange',
                    id: CurrentExchangeRecord
                })


            } else {
                /// create a new record for today.
                CurrentExchangeRecordObj = record.create({
                    type: 'customrecord_rmpay_currexchange'
                })
                /// Set header leavel Fields.
                var currentDate = new Date();
                CurrentExchangeRecordObj.setValue({
                    fieldId: 'custrecord_rmpay_ce_exchangedate',
                    value: currentDate,
                    ignoreFieldChange: true
                });
            }
            if (rmlib._validateData(bankCurrencyList) && rmlib._validateData(currencyList)) {
                var li = 0;
                for (var b = 0; b < bankCurrencyList.length; b++) {
                    var bankCurrencyid = bankCurrencyList[b].getValue(rmpay_company_bank_detailsSearchColAccountCurrency[0]);
                    var bankCurrency = bankCurrencyList[b].getText(rmpay_company_bank_detailsSearchColAccountCurrency[0]);

                    if (rmlib._validateData(bankCurrency)) {
                        for (var l = 0; l < currencyList.length; l++) {
                            var currencyName = currencyList[l].getValue(currencyColumns[0]);
                            var currencySymbol = currencyList[l].getValue(currencyColumns[1]);
                            var currencyId = currencyList[l].getValue(currencyColumns[2]);
                            var GlobalExchangeResponse;
                            if(bankCurrencyid == currencyId) {
                                GlobalExchangeResponse = {'baseCurrency': bankCurrency,'midRate':1,'quoteCurrency': currencyName,'code':200};
                            } else {
                                GlobalExchangeResponse = rmlib._getCurrencyExchangeRate(bankCurrency, currencyName);
                            }
                            //var GlobalExchangeResponse = rmlib._getCurrencyExchangeRate(bankCurrency, currencyName);
                            if (rmlib._validateData(GlobalExchangeResponse) && GlobalExchangeResponse.code == 200) {
                                var GlobalExchangeList 
                                if(bankCurrencyid == currencyId) {
                                    GlobalExchangeList = {'baseCurrency': bankCurrency,'midRate':1,'quoteCurrency': currencyName};
                                } else {
                                    GlobalExchangeList = _converResponseToArray(GlobalExchangeResponse.body);
                                }
                                if (rmlib._validateData(GlobalExchangeList)) {
                                    var bcurrency = GlobalExchangeList['quoteCurrency'];
                                    var tcurrency = GlobalExchangeList['baseCurrency'];
                                    var midRate = GlobalExchangeList['midRate'];
                                    log.debug({
                                        title: 'CUrrency Details',
                                        details: 'bcurrency:' + bcurrency + ' tcurrency:' + tcurrency + ' midRate:' + midRate + ' currencyName:' + currencyName + ' bankCurrency:' + bankCurrency
                                    });

                                    if ((bankCurrency == bcurrency) && (currencyName == tcurrency)) {
                                        CurrentExchangeRecordObj.setSublistValue({
                                            sublistId: 'recmachcustrecord_rmpay_cer_parent',
                                            fieldId: 'custrecord_rmpay_cer_bankcurrency',
                                            line: li,
                                            value: bankCurrencyid
                                        });
                                        CurrentExchangeRecordObj.setSublistValue({
                                            sublistId: 'recmachcustrecord_rmpay_cer_parent',
                                            fieldId: 'custrecord_rmpay_cer_rate',
                                            line: li,
                                            value: midRate
                                        });
                                        CurrentExchangeRecordObj.setSublistValue({
                                            sublistId: 'recmachcustrecord_rmpay_cer_parent',
                                            fieldId: 'custrecord_rmpay_cer_trancurrency',
                                            line: li,
                                            value: currencyId
                                        });
                                        li++;
                                    }
                                }
                            }
                        }
                    }
                }
                var id = CurrentExchangeRecordObj.save();
                log.debug("CurrentExchangeRecord id:", id)
            }// End of if condition of bankCurrencyList.

        }
        function _converResponseToArray(objectList) {
            var returnArray = {};
            var currentobject = JSON.parse(objectList);
            ///log.debug({ title: 'objectList', details: 'objectList:' + JSON.stringify(objectList) })
            var baseCurrency = currentobject['baseCurrency'];
            var midRate = currentobject['midRate'];
            var quoteCurrency = currentobject['quoteCurrency'];

            returnArray = { 'baseCurrency': baseCurrency, 'midRate': midRate, 'quoteCurrency': quoteCurrency };
            log.debug({ title: 'returnArray', details: 'returnArray:' + JSON.stringify(returnArray) })
            return returnArray;
        }
        return { execute }

    });
