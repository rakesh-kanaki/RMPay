/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/action', 'N/cache', 'N/ui/serverWidget', 'N/config', 'N/currency', 'N/currentRecord', 'N/dataset', 'N/error', 'N/format', 'N/log', 'N/record', 'N/search'],
  /**
* @param{action} action
* @param{cache} cache
* @param{serverWidget} serverWidget
* @param{config} config
* @param{currency} currency
* @param{currentRecord} currentRecord
* @param{dataset} dataset
* @param{error} error
* @param{format} format
* @param{log} log
* @param{record} record
* @param{search} search
*/
  (action, cache, serverWidget, config, currency, currentRecord, dataset, error, format, log, record, search) => {
    /**
     * Defines the Suitelet script trigger point.
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.request - Incoming request
     * @param {ServerResponse} scriptContext.response - Suitelet response
     * @since 2015.2
     */
    const onRequest = (scriptContext) => {
      var SourceAllProposal = {};
      var SourceSpecificProposal = {};
      var DisplaySpecificProposal = {};
      var assistant = serverWidget.createAssistant({
        title: "Ratio Propsal Review App",
        hideNavBar: false,
      });
      var AllProposal = assistant.addStep({
        id: "allproposal",
        label: "Select Propsals to Review",
      });
      var SelectedProposal = assistant.addStep({
        id: "selectedproposal",
        label: "Review Selected proposals",
      });
      var ReviewProposal = assistant.addStep({
        id: "raviewproposal",
        label: "Review the proposal",
      });
      var configureintegration = function () {
        assistant.addField({
          id: "custpage_ppa_subsidiary",
          type: "SELECT",
          label: "Subsidiary",
          source: "subsidiary",
        });
      };
      if (scriptContext.request.method == "GET") {
        //GET method means starting the assistant
        configureintegration();
        assistant.currentStep = AllProposal;
        scriptContext.response.writePage(assistant);
      } else if (scriptContext.request.parameters.next === "Finish") {
        assistant.currentStep = AllProposal;
        scriptContext.response.writePage(assistant);
      } else if (scriptContext.request.parameters.cancel) {
        assistant.currentStep = AllProposal;
        scriptContext.response.writePage(assistant);
      } else if (assistant.currentStep.stepNumber === 1) {
        //transition from step 1 to step 2
        configureintegration();
        log.debug({
          title: "onRequest",
          details: "assistant:" + JSON.stringify(assistant),
        });
        assistant.currentStep = assistant.getNextStep();
        scriptContext.response.writePage(assistant);
      } else if (assistant.currentStep.stepNumber === 2) {
        //transition from step 2 to step 3
        configureintegration();
        log.debug({
          title: "onRequest",
          details: "assistant:" + JSON.stringify(assistant),
        });
        assistant.currentStep = assistant.getNextStep();
        scriptContext.response.writePage(assistant);
      } else {
        //transition from step 2 back to step 1
        configureintegration();
        assistant.currentStep = assistant.getNextStep();
        scriptContext.response.writePage(assistant);
      }
    }

    return { onRequest }

  });
