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
        function onRequest(context) {
            if (context.request.method === 'GET') {
                var response = context.response;
                response.write('<html><head><title>My Suitelet</title></head><body>');
        
                response.write('<button id="myButton">Click me</button>');
                response.write('<div id="result"></div>');
        
                response.write('<script>');
                response.write('jQuery(document).ready(function($) {');
                response.write('   $("#myButton").click(function() {');
                response.write('       $.ajax({');
                response.write('           url: "your_ajax_endpoint_url",');
                response.write('           type: "GET",');
                response.write('           success: function(data) {');
                response.write('               $("#result").html(data);');
                response.write('           }');
                response.write('       });');
                response.write('   });');
                response.write('});');
                response.write('</script>');
        
                response.write('</body></html>');
            }
        }
        

        return {onRequest}

    });
