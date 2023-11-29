/**
 * Set a field value to empty if vendor bill is not present.
 * This is a SuiteScript 2.0 schedule script.
 */

/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define([
  "N/search",
  "N/record",
  "N/runtime",
  "./Lib/RMPay_common_lib",
], function (search, record, runtime, rmPayLib) {
  /**
   * Definition of the schedule script.
   * @param {Object} scriptContext
   * @param {string} scriptContext.type - The context in which the script is executed.
   * @returns {void}
   */
  function execute(context) {
    try {
      var customrecord_rmpay_bills_in_ppSearchObj = search.create({
        type: "customrecord_rmpay_bills_in_pp",
        filters: [
          ["custrecord_rmpay_bills_pp_vendorbill", "anyof", "@NONE@"],
          "AND",
          ["custrecord_rmpay_bills_pp_parent", "noneof", "@NONE@"],
        ],
        columns: [
          search.createColumn({ name: "internalid", label: "Internal ID" }),
        ],
      });

      var searchResult_ = customrecord_rmpay_bills_in_ppSearchObj.run();
      var searchResults = searchAll(searchResult_);

      if (searchResults.length > 0) {
        for (var i = 0; i < searchResults.length; i++) {
          var searchResult = searchResults[i];
          var ppBillId = searchResult.id;

          var InternalID = searchResult.getValue({
            name: "internalid",
          });

          if (ppBillId) {
            var ppBillRecord = record.load({
              type: "customrecord_rmpay_bills_in_pp", // Replace with your record type
              id: ppBillId,
            });

            var vendorBillId = ppBillRecord.getValue({
              fieldId: "custrecord_rmpay_bills_pp_vendorbill",
            });

            if (vendorBillId == "") {
              ppBillRecord.setValue({
                fieldId: "custrecord_rmpay_bills_pp_parent",
                value: "",
              });
            }

            var rec_id = ppBillRecord.save({
              enableSourcing: true,
              ignoreMandatoryFields: true,
            });

            log.debug("Affected Records==>", rec_id);
          }
        }
      }
    } catch (error) {
      log.error("Error in Execute()", error);
      var scriptId = runtime.getCurrentScript().id;
      var deployment_Id = runtime.getCurrentScript().deploymentId;
      rmPayLib._generateErrorRecord(scriptId, deployment_Id, error);
    }
  }
  function searchAll(resultset) {
    var allResults = []; // Array to store all results
    var startIndex = 0; // Initial index for pagination
    var RANGECOUNT = 1000; // Number of results to retrieve per page
    var pagedResultsCount; // Number of results on the current page

    // Loop until all results are retrieved
    while (true) {
      var pagedResults = resultset.getRange({
        start: startIndex,
        end: startIndex + RANGECOUNT,
      });

      // Add the retrieved results to the allResults array
      allResults.push.apply(allResults, pagedResults);

      // Get the number of results on the current page
      pagedResultsCount = pagedResults ? pagedResults.length : 0;

      // Update the start index for the next page
      startIndex += pagedResultsCount;

      // If the number of results on the current page is less than the range count,
      // it indicates that all results have been retrieved
      if (pagedResultsCount < RANGECOUNT) break;
    }

    return allResults;
  }

  return {
    execute: execute,
  };
});
