
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
							// Possible permissions can be found at https://wiki.guildwars2.com/wiki/API:2/tokeninfo
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
		// If API key didn't pass regex it can never be valid
		else{
			return false;
		}
}

/* With help of the achievement index, retrieve the actual status of the fractal achievement. 
The numbers in the bits array indicate the completed indices of the achievement, ie index 0 
is the first achievement.*/
function retrieveFractalAchievementStatus(apiKeyArray){

	// Dictionary to store account, achievementinfo pair
	var accountAchievementDictionary = {};
	var accountNameArray = []
	
	// Retrieve fractal achievements for every account.
	for(var i = 0; i < apiKeyArray.length; i++){
		(function(i){ // Anonymous function for closure
		
			if(apiKeyArray[i]){
				
				console.log("Current API key in loop" + apiKeyArray[i]);
				
				// Retrieve the achievement information from the API
				var achievementArray = retrieveAchievementAPI(apiKeyArray[i]); // let ajax oncomplete call findFractalAchievementIndex
				
				// Get indices for this specific ApiKey because they differ across accounts
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
				var fractalTotal = fractalInitiate.concat(fractalAdept, fractalExpert, fractalMaster); // verify that concatenation is working as expected
								
				// Get name and put it in the dictionary
				var accountName = retrieveAccountName(apiKeyArray[i]);
				accountNameArray[i] = accountName;
				
				accountAchievementDictionary[accountName] = fractalTotal;
				console.log( "Full array" + accountAchievementDictionary[accountName]);
				
				//Add to array of fixed lenth to make showing data easier
				// Set indices in the the total array to true
				
				
				// Dictionary to store the finished arrays
				var finishedAchievementsPerAccount={};
				
				// Initialize array full of false
				for(var i = 0; i < 100; i++){
					finishedAchievementsPerAccount[accountName][i] = false;
				}
				
				// Then for every index returned by the API, turn into true
				for (var i = 0; fractalTotal.length; i++){
					  finishedAchievementsPerAccount[accountName][fractalTotal[i]] = true;
				}
				
				
				// Debugging printing to console
				var arr = accountAchievementDictionary[accountName];
				var arrlength = arr.length;
				var alles = "";
				
				for(var i = 0; i < arrlength; i++){
					alles += (arr[i] + " ");
				}
				
				console.log("Alles: " + alles);
				
			}
		})(i); // Anonymous function for closure
	}
	
	displayData(accountNameArray, accountAchievementDictionary);
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

function compareToAchievementList(){
	
	
}



/* Displays the data as obtained by the API calls in a table, showing which ones are done and which ones are not. */
function displayData(accountNameArray, accountAchievementDictionary){
	
	// Create base table
	var myTableDiv = document.getElementById("resulttable");
    var table = document.createElement('TABLE');
    var tableBody = document.createElement('TBODY');
	
	table.border = '1';
    table.appendChild(tableBody);
	
	// Initialize variables
	var heading = new Array();
	var data = new Array();
	
	// Get the amount of accounts from the accountNameArray to make headers
	heading[0] = "Fractal number";
	for(var i = 0; i < accountNameArray.length; i++){
		heading[i+1] = accountNameArray[i];
		
		// Insert array from dictionary into data table
		data[i] = accountAchievementDictionary[accountNameArray[i]];
	}
	
	// Generate table columns
	var tr = document.createElement('TR');
    tableBody.appendChild(tr);
    for (i = 0; i < heading.length; i++) {
        var th = document.createElement('TH')
        th.width = '75';
        th.appendChild(document.createTextNode(heading[i]));
        tr.appendChild(th);
    }
	
	// Create rows
    for (i = 0; i < data.length; i++) {
        var tr = document.createElement('TR');
        for (j = 0; j < data[i].length; j++) {
            var td = document.createElement('TD');
            td.appendChild(document.createTextNode(data[i][j]+1)); // add 1 because its referenced by the index
            tr.appendChild(td);
        }
        tableBody.appendChild(tr);
    }  
    myTableDiv.appendChild(table);
	
}






