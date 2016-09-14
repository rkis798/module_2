var currentMood: Mood;
var currentAge: Age;
var currentGender: Gender;

var currentTime: Time;
var currentMenu: Menu;
var currentToy: Toy;

// Get elements from DOM
var pageheader = $("#page-header")[0]; //note the [0], jQuery returns an object, so to get the html DOM object we need the first item in the object
var pageheader2 = $("#page-header2")[0];
var pageheader3 = $("#page-header3")[0];
var pageheader4 = $("#page-header4")[0];
var pagecontainer = $("#page-container")[0]; 

// The html DOM object has been casted to a input element (as defined in index.html) as later we want to get specific fields that are only avaliable from an input element object
var imgSelector : HTMLInputElement = <HTMLInputElement> $("#my-file-selector")[0]; 

// Register button listeners
imgSelector.addEventListener("change", function () { // file has been picked
    pageheader.innerHTML = "Just a sec while we analyse your mood...";
    processImage(function (file) { //this checks the extension and file
        // Get emotions based on image
        sendEmotionRequest(file, function (emotionScores) { //here we send the API request and get the response
            // Find out most dominant emotion
            currentMood = getCurrMood(emotionScores); //this is where we send out scores to find out the predominant emotion

        });
        sendFaceRequest(file, function(faceAttributes) { // send the API request for age and gender
            currentAge = getCurrAge(faceAttributes);
            currentGender = getCurrGender(faceAttributes);
            currentTime = getTime();
            currentMenu = getMenu();
            
            changeUI();
        });
    });
});

function processImage(callback) : void {
    var file = imgSelector.files[0];  //get(0) is required as imgSelector is a jQuery object so to get the DOM object, its the first item in the object. files[0] refers to the location of the photo we just chose.
    var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file); //used to read the contents of the file
    } else {
        console.log("Invalid file");
    }
    reader.onloadend = function () { 
        //After loading the file it checks if extension is jpg or png and if it isnt it lets the user know.
        if (!file.name.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)){
            pageheader.innerHTML = "Please upload an image file (jpg or png).";
        } else {
            //if file is photo it sends the file reference back up
            callback(file);
        }
    }
}

function changeUI() : void {
    //Show detected mood
    if (currentMood.name == "sad") {
        pageheader.innerHTML = currentMood.message; 
    } else {
        pageheader.innerHTML= "";
    }
    
    pageheader2.innerHTML = "You are an: " + currentAge.name;
    pageheader3.innerHTML = "You are: " + currentGender.name;
    pageheader4.innerHTML = "Menu: " + currentMenu.name;

    //var imgAge : HTMLImageElement = <HTMLImageElement>  $("#selected-img")[0];
    var imgMenu : HTMLImageElement = <HTMLImageElement>  $("#selected-img-menu")[0];
    var imgToy : HTMLImageElement = <HTMLImageElement>  $("#selected-img-toy")[0];


    imgMenu.style.display = "block"; //just some formating of the menu's location
    if (currentToy != null) {
        imgToy.style.display = "block";
    }
    imgMenu.src = currentMenu.view;
    imgToy.src = currentToy.view;

    //Remove offset at the top
    pagecontainer.style.marginTop = "20px";
}

// Face API call
function sendFaceRequest(file, callback) : void {
    $.ajax({
        url: "https://api.projectoxford.ai/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender",
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "4963308ad5454124b82374a362db7c10");
        },
        type: "POST",
        data: file,
        processData: false
    })
        .done(function (data) {
            if (data.length != 0) { // if a face is detected
                // Get the emotion scores
                var faceAttributes = data[0].faceAttributes;
                callback(faceAttributes);
            } else {
                pageheader.innerHTML = "Hmm, we can't detect a human face in that photo. Please try another?";
            }
        })
        .fail(function (error) {
            pageheader.innerHTML = "Sorry, something went wrong. Please try again later.";
            console.log(error.getAllResponseHeaders());
        });
}

// Emotion API call
function sendEmotionRequest(file, callback) : void {
    $.ajax({
        url: "https://api.projectoxford.ai/emotion/v1.0/recognize",
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "aef63c302ce64ab3bb196c6b56b5d857");
        },
        type: "POST",
        data: file,
        processData: false
    })
        .done(function (data) {
            if (data.length != 0) { // if a face is detected
                // Get the emotion scores
                var scores = data[0].scores;
                callback(scores);
            } else {
                pageheader.innerHTML = "Hmm, we can't detect a human face in that photo. Please try another?";
            }
        })
        .fail(function (error) {
            pageheader.innerHTML = "Sorry, something went wrong. Please try again later.";
            console.log(error.getAllResponseHeaders());
        });
}

// Section of code that handles the mood

//A Mood class which has the mood as a string and its corresponding emoji
class Mood {
    name: string;
    message: string;
    constructor(public mood, public sentence) {
        this.name = mood;
        this.message = sentence;
    }
}

class Age {
    name: string;
    emoji: string;
    constructor(public age, public emojiurl) {
        this.name = age;
        this.emoji = emojiurl;
    }
}

class Gender {
    name: string;
    emoji: string;
    constructor(public gender, public emojiurl) {
        this.name = gender;
        this.emoji = emojiurl;
    }
}

class Time {
    name: string;
    emoji: string;
    constructor(public time, public emojiurl) {
        this.name = time;
        this.emoji = emojiurl;
    }
}

class Menu {
    name: string;
    view: string;
    constructor(public menu, public viewurl) {
        this.name = menu;
        this.view = viewurl;
    }
}

class Toy {
    name: string;
    view: string;
    constructor(public toy, public viewurl) {
        this.name = toy;
        this.view = viewurl;
    }
}

var happy : Mood = new Mood("happy", "http://emojipedia-us.s3.amazonaws.com/cache/a0/38/a038e6d3f342253c5ea3c057fe37b41f.png");
var sad : Mood  = new Mood("sad", "You seem sad :( Cheer yourself up with some dessert!");
var angry : Mood = new Mood("angry", "https://cdn.shopify.com/s/files/1/1061/1924/files/Very_Angry_Emoji.png?9898922749706957214");
var neutral : Mood  = new Mood("neutral", "https://cdn.shopify.com/s/files/1/1061/1924/files/Neutral_Face_Emoji.png?9898922749706957214");

var male : Gender = new Gender("male", "images/menu/boy.png");
var female : Gender = new Gender("female", "images/menu/girl.png");

var child : Age = new Age("child", "images/menu/kids.png");
var adult : Age = new Age("adult", "images/menu/burger.png");

var morning : Time = new Time("morning", "images/menu/breakfast.png");
var day : Time = new Time("day", "images/menu/burger.png");

var breakfast : Menu = new Menu("breakfast", "images/menu/breakfast.png");
var burger : Menu = new Menu("burger", "images/menu/burger.png");
var dessert : Menu = new Menu("dessert", "images/menu/dessert.png");
var kids : Menu = new Menu("kids", "images/menu/kids.png");

var boy : Toy = new Toy("boy", "images/menu/boy.png");
var girl : Toy = new Toy("girl", "images/menu/girl.png");

// any type as the scores values is from the project oxford api request (so we dont know the type)
function getCurrMood(scores : any) : Mood {
    // In a practical sense, you would find the max emotion out of all the emotions provided. However we'll do the below just for simplicity's sake :P
    if (scores.happiness > 0.4) {
        currentMood = happy;
    } else if (scores.sadness > 0.4) {
        currentMood = sad;
    } else if (scores.anger > 0.4) {
        currentMood = angry;
    } else {
        currentMood = neutral;
    }
    return currentMood;
}

function getCurrAge(faceAttributes : any) : Age {
    if (faceAttributes.age > 10) {
        currentAge = adult;
    }else{
        currentAge = child;
    }
    return currentAge;
}

function getCurrGender(faceAttributes : any) : Gender {
    if (faceAttributes.gender == "male") {
        currentGender = male;
    }else if (faceAttributes.gender == "female") {
        currentGender = female;
    }
    return currentGender;
}

function getTime () : any {
    var t : number;
    t = 13;
    if (t > 5.5 && t < 10.5) {
        currentTime = morning;
    } else {
        currentTime = day;
    }
    return currentTime;
}

function getMenu () {
    if (currentTime.name == "morning") {
        currentMenu = breakfast;
    } else if (currentAge.name == "adult") {
        if (currentMood.name == "sad") {
            currentMenu = dessert;
        } else {
            currentMenu = burger;
        }
    } else if (currentAge.name == "child") {
        currentMenu = kids;
        if (currentGender.name == "male") {
            currentToy = boy;
        } else if (currentGender.name == "female") {
            currentToy = girl;
        }
    }
    return currentMenu;
}
