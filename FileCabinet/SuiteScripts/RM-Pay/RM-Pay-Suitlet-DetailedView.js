/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
 define(['N/ui/serverWidget', 'N/search', 'N/url', 'N/file'], function (ui, search, url, file) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            var fileObj = file.load({
                id: './HTML/RM-Pay-Detailed-View-Iframe.html' //7534
            });           
            var htmlContent=fileObj.getContents();
            log.debug("htmlContent",htmlContent)
            var poIds = context.request.parameters.poIds;
            var poNumbers=context.request.parameters.poNumbers;
            poIds=JSON.parse(poIds)
            poNumbers=JSON.parse(poNumbers)
            var addButtons='';
            var addIframes='';
            log.debug("poIds",poIds)
            log.debug("poNumbers",poNumbers)

            for(var i=0;i<poIds.length;i++){
                log.debug("entry to for oop")
                //addButtons=addButtons+'<button class="tablinks" onclick="openPoOrder(event,'+"'"+poNumbers[i]+"'"+')">'+poNumbers[i]+'</button>'
                //addIframes=addIframes+'<div id="'+poNumbers[i]+'" class="tabcontent"><iframe width="1500px" height="1000px" src="https://2578009.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=208&id='+ poIds[i]+'" title="Proposal Order"></iframe></div>'
                if(i==0){
                    log.debug("entry to for oop")
                    addButtons=addButtons+'<button class="tablinks" onclick="openPoOrder(event,'+"'"+poNumbers[i]+"'"+')">'+poNumbers[i]+'</button>'
                    addIframes=addIframes+'<div id="'+poNumbers[i]+'" class="tabcontent" style="display:block" ><iframe width="1500px" height="1000px" src="/app/common/custom/custrecordentry.nl?rectype=208&id='+ poIds[i]+'&e=T&selectedtab=custom53" title="Proposal Order"></iframe></div>'
                }else{
                    log.debug("entry to for oop")
                    addButtons=addButtons+'<button class="tablinks" onclick="openPoOrder(event,'+"'"+poNumbers[i]+"'"+')">'+poNumbers[i]+'</button>'
                    addIframes=addIframes+'<div id="'+poNumbers[i]+'" class="tabcontent"><iframe width="1500px" height="1000px" src="/app/common/custom/custrecordentry.nl?rectype=208&id='+ poIds[i]+'&e=T&selectedtab=custom53" title="Proposal Order"></iframe></div>'
                }
            }
            log.debug("addButtons",addButtons)
            log.debug("addIframes",addIframes)

            htmlContent= htmlContent.replace("@PObuttons@", addButtons);
            htmlContent= htmlContent.replace("@iframes@", addIframes);
            log.debug("htmlContent",htmlContent)
            context.response.write(htmlContent);
        }
    }
   
    return {
        onRequest: onRequest
    };

});
