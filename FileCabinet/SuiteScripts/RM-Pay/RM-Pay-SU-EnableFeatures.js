/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/action', 'N/currency', 'N/error', 'N/log', 'N/record', 'N/render', 'N/runtime', 'N/search', 'N/ui/message', 'N/ui/serverWidget', 'N/xml'],
    /**
 * @param{action} action
 * @param{currency} currency
 * @param{error} error
 * @param{log} log
 * @param{record} record
 * @param{render} render
 * @param{runtime} runtime
 * @param{search} search
 * @param{message} message
 * @param{serverWidget} serverWidget
 * @param{xml} xml
 */
    (action, currency, error, log, record, render, runtime, search, message, serverWidget, xml) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} context
         * @param {ServerRequest} context.request - Incoming request
         * @param {ServerResponse} context.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (context) => {
            if (context.request.method === 'GET') {
                // Create a form
                var form = serverWidget.createForm({
                  title: 'RM Services',
                });
                
                // Add a field to the form
                form.addField({
                  id: 'custrecord_rm_ef_rmpay',
                  type: serverWidget.FieldType.CHECKBOX,
                  label: 'RM-Pay Module'
                });
                
                // Add a submit button to the form
                form.addSubmitButton({
                  label: 'Submit'
                });
                
                // Display the form
                context.response.writePage(form);
              }
              else if (context.request.method === 'POST') {
                // Retrieve the submitted field value
                var myFieldValue = context.request.parameters.custrecord_rm_ef_rmpay;
                
                // Create a new record
                /*var myRecord = record.create({
                  type: record.Type.CUSTOMER,
                  isDynamic: true,
                });
                
                // Set field values on the record
                myRecord.setValue({
                  fieldId: 'companyname',
                  value: myFieldValue
                });
                
                // Save the record
                var recordId = myRecord.save();
                
                // Send a response back to the user
                context.response.write('Customer record created with ID: ' + recordId);*/
              }
        }

        return {onRequest}

    });
