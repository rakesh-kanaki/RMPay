/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([],
    
    () => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            /**
 * This SuiteScript function demonstrates how to add a tab to a NetSuite record form and
 * use client-side scripting to collapse the tab when the page loads.
 */
function addTabAndCollapse() {
    // Create a NetSuite form object
    var myForm = serverWidget.createForm({
      title: 'My NetSuite Form',
    });
  
    // Add a tab to the form
    var tab = myForm.addTab({
      id: 'custpage_my_tab',
      label: 'My Tab',
    });
  
    // Add fields to the tab
    var field1 = myForm.addField({
      id: 'custpage_field1',
      type: serverWidget.FieldType.TEXT,
      label: 'Field 1',
      container: 'custpage_my_tab',
    });
  
    var field2 = myForm.addField({
      id: 'custpage_field2',
      type: serverWidget.FieldType.TEXT,
      label: 'Field 2',
      container: 'custpage_my_tab',
    });
  
    // Add a client script to collapse the tab when the page loads
    myForm.clientScriptModulePath = './MyClientScript.js'; // Specify the path to your client script
  }
  
  // Call the function as needed
  addTabAndCollapse();
  
        }

        return {onRequest}

    });
