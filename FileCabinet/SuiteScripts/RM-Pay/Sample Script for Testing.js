/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 *@NModuleScope SameAccount
 */
define(["N/currentRecord", "N/record", "N/runtime", "N/search"], function (
  currentRecord,
  record,
  runtime,
  search
) {
  function pageInit(context) {
    var button_Pressed = confirm("Press a button!");
    alert(button_Pressed);
    // try {
    //   alert("In PageInit==>");
    //   var floatNum = 0 / 12;
    // } catch (error) {
    //   alert("Error in PageInit==>" + error);
    //   var recid = "12";
    //   var rectype = "Sample";
    //   var err = error;
    //   _generateErrorRecord(recid, rectype, err);
    // }
  }

  // function _generateErrorRecord(recid, rectype, err) {
  // var Errorrec = record.create({
  //   type: "customrecord_rmpay_error_log",
  //   isDynamic: true,
  // });
  // Errorrec.setValue({
  //   fieldId: "custrecord_rm_rmpe_transaction",
  //   value: recid,
  // });
  // Errorrec.setValue({
  //   fieldId: "custrecord_rm_rmpe_recid",
  //   value: recid,
  // });
  // Errorrec.setValue({
  //   fieldId: "custrecord_rm_rmpe_recid",
  //   value: recid,
  // });
  // Errorrec.setValue({
  //   fieldId: "custrecord_rm_rmpe_errortype",
  //   value: err.name,
  // });
  // Errorrec.setValue({
  //   fieldId: "custrecord_rm_rmpe_errordetails",
  //   value: err.message,
  // });
  // var id = Errorrec.save();
  // }

  return {
    pageInit: pageInit,
  };
});
