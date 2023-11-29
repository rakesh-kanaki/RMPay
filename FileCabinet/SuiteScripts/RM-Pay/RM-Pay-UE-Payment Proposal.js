/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/currentRecord', 'N/error', 'N/file', 'N/log', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', './Lib/RMPay_common_lib'],
    /**
 * @param{currentRecord} currentRecord
 * @param{error} error
 * @param{file} file
 * @param{log} log
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (currentRecord, error, file, log, record, runtime, search, serverWidget, rmlib) => {
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
            log.debug({
                title: 'scriptContext*',
                details: scriptContext.type
            })
            if ((runtime.executionContext != runtime.ContextType.USER_INTERFACE) && (scriptContext.type == scriptContext.UserEventType.CREATE && scriptContext.type == scriptContext.UserEventType.VIEW)) {
                return '';
            }
            var form = scriptContext.form;

            var subtab_n = form.addTab({
                id: 'custpagetab_custtab',
                label: 'Associated Bills'
            })
            var sublistObj2 = form.addSublist({
                id: 'custpagetab_custlist',
                type: serverWidget.SublistType.LIST,
                tab: 'custpagetab_custtab',
                label: 'Total:'
            })
            sublistObj2.addField({
                //id: 'custpage_select',
                id: 'custpage_select',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Select',
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            });
            sublistObj2.addMarkAllButtons();
            sublistObj2.addField({
                id: 'custrecord_rmpay_bills_pp_transnr',
                type: serverWidget.FieldType.TEXT,
                label: 'Transaction NO',
            })
            sublistObj2.addField({
                id: 'custrecord_rmpay_bills_pp_vendorbill',
                type: serverWidget.FieldType.SELECT,
                source: 'transaction',
                label: 'Vendor Bill',
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            sublistObj2.addField({
                id: 'custrecord_rmpay_bills_pp_vendor',
                type: serverWidget.FieldType.SELECT,
                source: 'vendor',
                label: 'Vendor',
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            sublistObj2.addField({
                id: 'custrecord_rmpay_bills_pp_duedate',
                type: serverWidget.FieldType.DATE,
                label: 'Due Date',
            });
            var uniqfld = sublistObj2.addField({
                id: 'custrecord_rmpay_bills_pp_curr_amt',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Amount In Account Currency'
            });
            sublistObj2.updateTotallingFieldId({ id: 'custrecord_rmpay_bills_pp_curr_amt' })
            sublistObj2.addField({
                id: 'custrecord_rmpay_bills_pp_currency',
                type: serverWidget.FieldType.SELECT,
                label: 'Currency',
                source: 'currency'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            sublistObj2.addField({
                id: 'custrecord_rmpay_bills_pp_exrt',
                type: serverWidget.FieldType.FLOAT,
                label: 'Exchange Rate'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            sublistObj2.addField({
                id: 'custrecord_rmpay_bills_pp_amount',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Bill Amount',
            })

            sublistObj2.addField({
                id: 'custrecord_rmpay_childid',
                type: serverWidget.FieldType.TEXT,
                label: 'ID',
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            var ResultsColums = [];
            var CUSTRECORD_RMPAY_BILLS_PP_PARENT = 'CUSTRECORD_RMPAY_BILLS_PP_PARENT';
            ResultsColums.push(search.createColumn({ name: "custrecord_rmpay_bills_pp_curr_amt", join: CUSTRECORD_RMPAY_BILLS_PP_PARENT, label: "Amount In Account Currency" }));  //  ---1
            ResultsColums.push(search.createColumn({ name: "custrecord_rmpay_bills_pp_amount", join: CUSTRECORD_RMPAY_BILLS_PP_PARENT, label: "Amount" }));  //  ---2
            ResultsColums.push(search.createColumn({ name: "custrecord_rmpay_bills_pp_exrt", join: CUSTRECORD_RMPAY_BILLS_PP_PARENT, label: "Exchange Rate" }));  //  ---3
            ResultsColums.push(search.createColumn({ name: "custrecord_rmpay_bills_pp_vendorbill", join: CUSTRECORD_RMPAY_BILLS_PP_PARENT, label: "Vendor Bill" }));//  //  ---4
            ResultsColums.push(search.createColumn({ name: "custrecord_rmpay_bills_pp_transnr", join: CUSTRECORD_RMPAY_BILLS_PP_PARENT, label: "Transaction ID" }));  //  ---5
            ResultsColums.push(search.createColumn({ name: "custrecord_rmpay_bills_pp_duedate", join: CUSTRECORD_RMPAY_BILLS_PP_PARENT, label: "Due Date" }));  //  ---6
            ResultsColums.push(search.createColumn({ name: "custrecord_rmpay_bills_pp_currency", join: CUSTRECORD_RMPAY_BILLS_PP_PARENT, label: "Currency" }));  //  ---7
            ResultsColums.push(search.createColumn({ name: "custrecord_rmpay_bills_pp_vendor", join: CUSTRECORD_RMPAY_BILLS_PP_PARENT, label: "Vendor" }));  //  ---8
            ResultsColums.push(search.createColumn({ name: "altname", label: "Name" }));    //  ---9
            ResultsColums.push(search.createColumn({ name: "custrecord_rmpay_pp_currency", label: "Currency" }));     //  ---10
            ResultsColums.push(search.createColumn({ name: "custrecord_rmpay_pp_amount", label: "Amount" }));           //  ---11
            ResultsColums.push(search.createColumn({ name: "custrecord_rmpay_pp_nr_of_bills", label: "Number of Bills" }));  //  ---12
            ResultsColums.push(search.createColumn({ name: "internalid", join: CUSTRECORD_RMPAY_BILLS_PP_PARENT, label: "Child Id" }));  //  ---13

            var poIds = [];
            //var currentRecord = currentRecord.get();
            var currentRecord = scriptContext.newRecord;
            poIds.push(currentRecord.id);
            log.debug({
                title: 'currentRecord',
                details: JSON.stringify(currentRecord)
            });
            var dataResult = rmlib._getDataForProposals(poIds, ResultsColums);
            log.debug({
                title: 'dataResult',
                details: JSON.stringify(dataResult)
            });
            var i=0;
            for (var d = 0; d < dataResult[poIds[0]].length; d++) {
                var rdata = dataResult[poIds[0]][d];
                sublistObj2.setSublistValue({ id:'custpage_select', line: d, value: 'T' })
                sublistObj2.setSublistValue({ id: 'custrecord_rmpay_childid', line: d, value: rdata.custrecord_rmpay_childid.id ? rdata.custrecord_rmpay_childid.id : ' '  })
                if (rdata.custrecord_rmpay_bills_pp_vendorbill.id) {
                    sublistObj2.setSublistValue({ id: 'custrecord_rmpay_bills_pp_vendorbill', line: d, value: rdata.custrecord_rmpay_bills_pp_vendorbill.id ? rdata.custrecord_rmpay_bills_pp_vendorbill.id : ' ' })
                  }
                  sublistObj2.setSublistValue({ id: 'custrecord_rmpay_bills_pp_transnr', line: d, value: rdata.custrecord_rmpay_bills_pp_transnr ? rdata.custrecord_rmpay_bills_pp_transnr : ' ' })
                  if (rdata.custrecord_rmpay_bills_pp_duedate) {
                    sublistObj2.setSublistValue({ id: 'custrecord_rmpay_bills_pp_duedate', line: d, value: rdata.custrecord_rmpay_bills_pp_duedate })
                  }
                  //custrecord_rmpay_bills_pp_exrt_
                  sublistObj2.setSublistValue({ id: 'custrecord_rmpay_bills_pp_exrt', line: d, value: rdata.custrecord_rmpay_bills_pp_exrt ? rdata.custrecord_rmpay_bills_pp_exrt : ' ' })
                  sublistObj2.setSublistValue({ id: 'custrecord_rmpay_bills_pp_curr_amt', line: d, value: rdata.custrecord_rmpay_bills_pp_curr_amt ? rdata.custrecord_rmpay_bills_pp_curr_amt : ' ' })
                  sublistObj2.setSublistValue({ id: 'custrecord_rmpay_bills_pp_currency', line: d, value: rdata.custrecord_rmpay_bills_pp_currency ? rdata.custrecord_rmpay_bills_pp_currency : ' ' })
                  sublistObj2.setSublistValue({ id: 'custrecord_rmpay_bills_pp_amount', line: d, value: rdata.custrecord_rmpay_bills_pp_amount ? rdata.custrecord_rmpay_bills_pp_amount : ' ' })
                  //custrecord_rmpay_bills_pp_vendor
                  if (rdata.custrecord_rmpay_bills_pp_vendor.id) {
                    sublistObj2.setSublistValue({ id: 'custrecord_rmpay_bills_pp_vendor', line: d, value: rdata.custrecord_rmpay_bills_pp_vendor.id ? rdata.custrecord_rmpay_bills_pp_vendor.id : ' ' })
                  }
                  //id: 'custpage_select',
                  
            }
            form.addSublist({
                id: 'custpage_dummy',
                type: serverWidget.SublistType.STATICLIST,
                tab: 'custpagetab_custtab',
                label: ' '
            });
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

        return { beforeLoad, beforeSubmit, afterSubmit }

    });
