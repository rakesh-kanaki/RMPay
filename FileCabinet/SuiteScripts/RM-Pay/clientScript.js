/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define([], function () {

    function toggleTab1() {
        var tab1FieldGroup = document.getElementById('tab1_fieldgroup');
        if (tab1FieldGroup) {
           // tab1FieldGroup.style.display = (tab1FieldGroup.style.display === 'none') ? 'block' : 'none';
        }
    }
    function pageInit(context) {
		
	}

    return {
        pageInit: pageInit,
        toggleTab1: toggleTab1
    };
});
