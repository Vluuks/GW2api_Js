
// frac achieves https://api.guildwars2.com/v2/achievements/categories/30
// [382,381,391,383,392,384,393,385,394,386,395,387,396,388,397,389,398,390,399,1189,1195,1191,1197,1194,1190,1196,1193,1198,1192,2493,2567,2206,2346,2156,2519,2475,2158,2379,2965,2894,2217,2415,2344,2434,2248,2408,3051,3047,3080,3149,3101]
// FRACS 2965,2894,2217,2415

/* Obtain player's API keys from input field on website and check how many were
actually supplied (2 minimum), also check whether they are valid and not missing 
permissions needed to access achievement status. */

function getUserAPI(){
	
	// Loop over the elements in the form to obtain API keys
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
    
    
    // Check if user specified at least 2 API keys
    if(missingApi > 3){
    	alert("Please specify at least 2 valid API keys to allow comparison.")
    }
    
    // Verify that the first field is filled, this is required for finding the achievements
    if(elements.item(0) == "")
    {
    	alert("Please fill in the first field with a valid API key.");
    }
    
    // If the first field is not empty and there are at least 2 API keys present,
    // proceed with API key verification process.
    else{
    	
    	var apiStatus;
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
    		alert("At least one API key is missing permissions or invalid.\nPlease make sure you are using a valid key that allows access of your achievmenents.")
    	}
    	else{
    		//alert("API VALID WOOHOO"); // Is always triggered for now due to validation bug.
    		
    		
    		// Pass the arrray of apiKeys
    		// They have been verified at this point, we only need to check if they are not empty
    		retrieveFractalAchievementStatus(apiKeyArray);
    	}
    	
    }
    
}


/* Werkt niet naar behoren, ik krijg een 503 bij een invalid key dus ik mag dan 
ook niet kijken wat ie returnt aan data. Ik moet kunnen controleren of ik een 503 
error krijg in de request.*/
function verifyApi(apiKey){
	
		$.ajax({
		type: "GET",
		async: false,
		url: "https://api.guildwars2.com/v2/tokeninfo?access_token=" + apiKey,
		cache: false,
		dataType: 'text',
		
			success: function (){},
			error: function(){},
			
			// Wait until request is done.
			complete: function(data){
				// Parse json object
				var apiresult = JSON.parse(data.responseText);
				// Check if it's a valid key
				if(apiresult.text == "endpoint requires authentication")
					return false;
				else
					return true;
			}    
	});
}


/* With help of the achievment index, retrieve the actual status of the fractal achievement. 
The numbers in the bits array indicate the completed indices of the achievement, ie index 0 
is the first achievement.*/
function retrieveFractalAchievementStatus(apiKeyArray){

	// Dictionary to store account, achievementinfo pair
	var accountAchievementDictionary = {};
	var accountNameArray = []
	
	// Retrieve fractal achievements for every account.
	for(var i = 0; i < apiKeyArray.length; i++){
		if(apiKeyArray[i] != "" && apiKeyArray[i] != undefined){
			
			
			console.log("Current API key in loop" + apiKeyArray[i]);
			
			// Retrieve the achievement information from the API
			var achievementArray = retrieveAchievementAPI(apiKeyArray[i]);
			
			
			// Get indices for this specific ApiKey because they differ
			var indexArray = findFractalAchievementIndex(achievementArray);
			
			var fractalInitiate = [];
			var fractalAdept = [];
			var fractalExpert = [];
			var fractalMaster = [];
			
			// Get achievement bits using the indices
			fractalInitiate = achievementArray[indexArray[0]].bits;
			fractalAdept = achievementArray[indexArray[1]].bits;
			fractalExpert = achievementArray[indexArray[2]].bits;
			fractalMaster = achievementArray[indexArray[3]].bits;
			
			// Concatenate arrays
			var fractalTotal = fractalInitiate.concat(fractalAdept, fractalExpert, fractalMaster);
			
			// Get name and put it in the dictionary
			var accountName = retrieveAccountName(apiKeyArray[i]);
			accountNameArray[i] = accountName;
			
			accountAchievementDictionary[accountName] = fractalTotal;
			console.log( "Hele array" + accountAchievementDictionary[accountName]);
			
			
			// even om het te printen
			var arr = accountAchievementDictionary[accountName];
			var arrlength = arr.length;
			var alles = "";
			
			for(var i = 0; i < arrlength; i++){
				alles += (arr[i] + " ");
			}
			
			console.log("Alles: " + alles);
			
			
		}
	}
}



/* Retrieves all information about all achievements of a given account. */
function retrieveAchievementAPI(apiKey){
	
		var achievementArray;
	
		$.ajax({
		type: "GET",
		async: false,
		url: "https://api.guildwars2.com/v2/account/achievements?access_token=" + apiKey,
		cache: false,
		dataType: 'text',
		
			success: function (){},
			error: function(){},
			
			// Wait until request is done.
			complete: function(data){
				// Parse json object
				achievementArray = JSON.parse(data.responseText);
				console.log("finished api call to achievements");
			}
		});
		
		return achievementArray;
}


/* Find the achievements in the achievement array and find the corresponding 
index to avoid extra looping for the other player's achievement arrays */	
function findFractalAchievementIndex(achievementArray){
	
	var indexArray = []
	
	/* Reverse might be faster due to the recent nature of these achievements? */
	for(var i = 0, length = achievementArray.length; i < length; i++){
		switch(achievementArray[i].id){
			case 2965:
				indexArray[0] = i;
				console.log(i);
				break;
			case 2894:
				indexArray[1] = i;
				console.log(i);
				break;
			case 2217:
				indexArray[2] = i;
				console.log(i);
				break;
			case 2415:
				indexArray[3] = i;
				console.log(i);
				break;
		} 
	}
	
	console.log("currently in indexarray");
	console.log(indexArray[0]);
	console.log(indexArray[1]);
	console.log(indexArray[2]);
	console.log(indexArray[3]);
	return indexArray;
}


/* Retrieves all information about all achievements of a given account. */
function retrieveAccountName(apiKey){
	
		var accountName;
	
		$.ajax({
		type: "GET",
		async: false,
		url: "https://api.guildwars2.com/v2/account?access_token=" + apiKey,
		cache: false,
		dataType: 'text',
		
			success: function (){},
			error: function(){},
			
			// Wait until request is done.
			complete: function(data){
				// Parse json object
				console.log("API" + apiKey);
				
				console.log(data);
				
				var accountInfo = JSON.parse(data.responseText);
				accountName = accountInfo.name;
			}
		});
		
		return accountName;
}






