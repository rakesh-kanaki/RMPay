/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/format','N/action', 'N/config', 'N/currency', 'N/currentRecord', 'N/error', 'N/file', 'N/http', 'N/https', 'N/log', 'N/record', 'N/recordContext', 'N/search', 'N/workflow', 'N/xml', './Lib/RMPay_common_lib'],
    /**
 * @param{action} action
 * @param{config} config
 * @param{currency} currency
 * @param{currentRecord} currentRecord
 * @param{error} error
 * @param{file} file
 * @param{http} http
 * @param{https} https
 * @param{log} log
 * @param{record} record
 * @param{recordContext} recordContext
 * @param{search} search
 * @param{workflow} workflow
 * @param{xml} xml
 */
    (format,action, config, currency, currentRecord, error, file, http, https, log, record, recordContext, search, workflow, xml, rmlib) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            var record = scriptContext.newRecord;
            var rectype = record.type
            //log.debug("rectype",rectype)
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

            var currentRecord = scriptContext.newRecord;
            //1) Value from field Bill - Subsidiary should equal custrecord_rmpay_cbd_subsidiary 
            //2) Value from field Bill - Currency should equal custrecord_rmpay_cbd_pay_currencies
            var subsidary = currentRecord.getValue({ fieldId: 'subsidiary' });
            var currency = currentRecord.getValue({ fieldId: 'currency' });
            var vendorid = currentRecord.getValue({ fieldId: 'entity' });
            var OrderDate = currentRecord.getValue({fieldId: 'trandate'});
            var searchdata = { 'subsidary': subsidary, "currency": currency };
            var RMPayBankAccount = currentRecord.getValue({ fieldId: 'custbody_rmpay_bbd_cbd' });
            try {
                if (rmlib._validateRMPay(searchdata) && rmlib._validateRMVendor(vendorid)) {
                    log.debug("beforeSubmit", "RM-Pay applicable to this Bill");
                    //if (rmlib._validateRMVendor(vendorid)) {
                    if(!rmlib._validateData(RMPayBankAccount)) {
                        var RMPayBankAccountDetails = rmlib._getCompanyBankDeatils(searchdata);
                        log.debug({ title: 'RM-Pay beforeSubmit', details: "RMPayBankAccountDetails:" + JSON.stringify(RMPayBankAccountDetails) });
                        ///log.debug({title:'oujhiub io-v j',details: rmlib._validateData(RMPayBankAccountDetails)})
                        if (rmlib._validateData(RMPayBankAccountDetails)) {
                            for (var key in RMPayBankAccountDetails) {
                                log.debug({ title: 'RM-Pay beforeSubmit', details: "Key:" + key + "Value:" + RMPayBankAccountDetails[key] });
                                currentRecord.setValue({
                                    fieldId: key,
                                    value: RMPayBankAccountDetails[key]
                                });
                            }
                        }
                    }
                        // add the condition here to update exchange rate.
                        {
                            //custbody_rmpay_bbd_exch_rate
                            //Logic to get Exchange Rate.
                            var ExchangeRate = 0;
                            var tranCurrency = currentRecord.getValue({ fieldId: 'currency' });
                            var totalAmt = currentRecord.getValue({ fieldId: 'total' });
                            var BankCurrency = currentRecord.getValue({ fieldId: 'custbody_rmpay_bbd_acct_curr'})
                            //var datefltr = [OrderDate, OrderDate];
                            if (BankCurrency == tranCurrency) {
                                //same Transaction currency as of Bank currency.
                                ExchangeRate = 1;
                            } else {
                                // Currency on Transaction is different from Bank.
                                //ExchangeRate = rmlib._getCurrencyExchangeRate(RMPayBankAccountDetails['custbody_rmpay_bbd_acct_curr'],tranCurrency)
                                var Dateflt = format.format({
                                    value: OrderDate,
                                    type: format.Type.DATE
                                });
                                log.debug("Dateflt",Dateflt)
                                ExchangeRate = rmlib._getCurrencyExchangeRateDetails(BankCurrency, tranCurrency, Dateflt)////currentRecord.getValue({ fieldId: 'exchangerate' });
                            }
                            log.debug("ExchangeRate",ExchangeRate)
                            currentRecord.setValue({
                                fieldId: 'custbody_rmpay_bbd_exch_rate',
                                value: ExchangeRate
                            });
                            currentRecord.setValue({
                                fieldId: 'custbody_rmpay_bbd_curr_amt',
                                value: (ExchangeRate * totalAmt)
                            });
							//custbody_rmpay_bbd_ready_for_pp
							currentRecord.setValue({
                                fieldId: 'custbody_rmpay_bbd_ready_for_pp',
                                value: true
                            });
                        }
                    //}

                } else {
                    log.debug("beforeSubmit", "RM-Pay not applicable to this Bill");
                }
            } catch (e) {
                log.debug(' error===>',e.toString());
                ///rmlib._generateErrorRecord(currentRecord.getValue({ fieldId: 'internalid'}), e)
            }

            //log.debug("rectype",rectype)
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            //log.debug({title: 'RM-Pay afterSubmit',details: JSON.stringify(rmlib)});
        }

        return { beforeLoad, beforeSubmit, afterSubmit }

    });
