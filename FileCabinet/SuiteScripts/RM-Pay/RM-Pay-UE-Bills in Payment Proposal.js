/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/cache', 'N/currentRecord', 'N/error', 'N/log', 'N/record', 'N/search', './Lib/RMPay_common_lib'],
    /**
 * @param{cache} cache
 * @param{currentRecord} currentRecord
 * @param{error} error
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (cache, currentRecord, error, log, record, search,rmlib) => {
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
            var parent = currentRecord.getValue({ fieldId: 'custrecord_rmpay_bills_pp_parent' });

            if(rmlib._validateData(parent)) {
                /*currentRecord.setValue({
                    fieldId: 'custrecord_rmpay_bills_pp_or_ref',
                    value: parent
                });*/
            }
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

        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
