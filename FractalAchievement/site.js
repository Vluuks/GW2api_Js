
// frac achieves https://api.guildwars2.com/v2/achievements/categories/30
// [382,381,391,383,392,384,393,385,394,386,395,387,396,388,397,389,398,390,399,1189,1195,1191,1197,1194,1190,1196,1193,1198,1192,2493,2567,2206,2346,2156,2519,2475,2158,2379,2965,2894,2217,2415,2344,2434,2248,2408,3051,3047,3080,3149,3101]
// FRACS 2965,2894,2217,2415

/* Obtain player's API keys from input field on website and check how many were
actually supplied (2 minimum), also check whether they are valid and not missing 
permissions needed to access achievement status. */
function getUserAPI(){
	
	// Declare variables
    var apiKeyArray = [];
    var missingApi = 0;
    var elements = document.getElementById("apiform").elements;
    
    for(var i = 0 ; i < elements.length ; i++){
        var item = elements.item(i);
        apiKeyArray[i] = item.value.trim();
        
        if(item.value == ""){
        	missingApi++;
        }
    }
	
	console.log("missing apis" + missingApi);
    
    // Check if user specified at least 2 API keys
    if(missingApi > 3){
		$('#error').text("Please specify at least 2 valid API keys to allow comparison.");
    }
    // Verify that the first field is filled, this is required for finding the achievements
    else if(elements.item(0) == "" || elements.item(0) == undefined )
    {
    	$('#error').text("Please do not omit the first field.");
    }
    // If the first field is not empty and there are at least 2 API keys present
    else if (missingApi <= 3 && elements.item(0) != ""){ 
    	
		console.log("entered else, proceeding to validation");
		
    	var apiStatus;
		
		// Validate API key for every key in array
    	for(var i = 0; i < apiKeyArray.length ; i++){
    		
    		console.log("Checking if API valid:" + apiKeyArray[i]);
    		
    		if(apiKeyArray[i] != ""){
    			if (verifyApi(apiKeyArray[i]) == false){
    				apiStatus = false;
    				console.log("API not valid: false");
    			}
    		}
    	}
    	
    	// If one or more of the API keys provided are missing permissions, abort.
    	if(apiStatus == false){
    		$('#error').text("One ore more API keys are either missing permissions or invalid.");
    	}
		// If all API's passed verification, proceed
    	else{
    		$('#error').text("API's verified, beginning achievement comparison.");
    		
    		// Pass the arrray of apiKeys. They have been verified at this point, we only need to check if they are not empty in the case that someone wants to compare less than five members
    		retrieveFractalAchievementStatus(apiKeyArray);
    	}	
    }
}


/* Check if API key is of a valid format and if so, check if the needed permissions were given. */
function verifyApi(apiKey){
	
		// Use regex to do sanity check 
		if (/^[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{20}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}$/.test(apiKey)){

			$.ajax({
			type: "GET",
			async: true,
			url: "https://api.guildwars2.com/v2/tokeninfo?access_token=" + apiKey,
			cache: false,
			dataType: 'text',
			
				success: function (){},
				error: function(){
					return false;
				},
				// Check if it's a valid key even if it passed regex
				complete: function(data){

					var apiResult = JSON.parse(data.responseText);
					console.log(apiResult);
					
					// If the key matches the expected format but is still invalid
					if(apiResult.text && (apiResult.text.equals("endpoint requires authentication") || apiResult.text.equals("invalid key")))
						return false;
				
					// If the permissions array exists in JSON
					if(apiResult.permissions){
						
						var permissionCount = 0;
						for(var i = 0; i <apiResult.permissions.length; i++){
							
							// Check for the necessary permissions
							switch(apiResult.permissions[i]){
								case "characters":
									permissionCount++;
									break;
								case "account":
									permissionCount++;
									break;
								case "builds":
									permissionCount++;
									break;
								case "progression":
									permissionCount++;
									break;
							}
						}
						
						// Check if permission requirements were met
						if(permissionCount == 4)
							return true;
						else
							return false;
					}
				}    
			});
		}
		// If API key didn't pass regex it's can never be valid
		else{
			return false;
		}
}











