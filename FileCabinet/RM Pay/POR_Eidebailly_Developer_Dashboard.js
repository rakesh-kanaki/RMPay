// BEGIN SCRIPT DESCRIPTION BLOCK ==================================
{
  /*
      Script Name:POR_Eidebailly_Developer_Dashboard
      Author: Mayur Bhandare
      Company: Blueflamelabs Pvt. Ltd.
      Date: 15/04/2022
      Script Modification Log:
      -- version-- -- Date -- -- Modified By -- --Requested By-- -- Description --
          1.0      15/04/2022   Mayur Bhandare    Sujit Rathod    This script will be used to display the Developer Dashboard on NetSuite Portlet The dashboard is fetched from JIRA Cloud Platform. This script will have one script parameter i.e. suitelet_Url which will contain the url for suitelet in which our whole logic is written.
        */
}
// END SCRIPT DESCRIPTION BLOCK ====================================
/**
 *@NApiVersion 2.1
 *@NScriptType Portlet
 */

// This sample creates a portlet that displays simple HTML
define(["N/runtime", "N/search", "N/url"], function (runtime, search,url) {
  function render(params) {
    var currentUser = runtime.getCurrentUser();

    // log.debug({
    //   title: "Current User==>",
    //   details: currentUser,
    // });

    // var employeeValues = search.lookupFields({
      // type: search.Type.EMPLOYEE,
      // id: currentUser.id,
      // columns: ["custentity_jira_user_id", "title", "firstname", "lastname"],
    // });

    //var jiraUserID = employeeValues.custentity_jira_user_id;
    //var jobTitle = employeeValues.title;
    //var empFirstName = employeeValues.firstname;
    //var empLastName = employeeValues.lastname;

    // if (jiraUserID != "" || jobTitle == "Manager") {
    params.portlet.title = "Developer Dashboard--- Rakesh";

    var currentScript = runtime.getCurrentScript();

    var suiteletUrl = currentScript.getParameter({
      name: "customscript_rm_rmpay_suitlet",
    });
    var suiteletUrl =url.resolveScript({
          scriptId: "customscript_rm_rmpay_suitlet",
          deploymentId: "customdeploy_rmpay_suitlet",
        })

    /*suiteletUrl +=
      "&jiraUserID=" +
      jiraUserID +
      "&jobTitle=" +
      jobTitle +
      "&empFirstName=" +
      empFirstName +
      "&empLastName=" +
      empLastName;*/
    var linefldcontent =
      '<html><body><iframe allowtransparency="true" width=100% height=100% style="height:400px;" frameBorder="0" src=' +
      suiteletUrl +
      "></iframe></html></body>";
    params.portlet.html = linefldcontent;
    // }
  }

  return {
    render: render,
  };
});


              