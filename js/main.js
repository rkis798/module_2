var currentMood;
var currentAge;
var currentAgeYears;
var currentGender;
var currentTime;
var currentMenu;
var currentToy;
var currTime;
// Get elements from DOM
var pageheader = $("#page-header")[0]; //note the [0], jQuery returns an object, so to get the html DOM object we need the first item in the object
var pageheader2 = $("#page-header2")[0];
var pageheader3 = $("#page-header3")[0];
var pageheader4 = $("#page-header4")[0];
var pagecontainer = $("#page-container")[0];
var mainButton = $("#mainButton")[0];
// The html DOM object has been casted to a input element (as defined in index.html) as later we want to get specific fields that are only avaliable from an input element object
var imgSelector = $("#my-file-selector")[0];
// Register button listeners
imgSelector.addEventListener("change", function () {
    pageheader.innerHTML = "Just a sec while we analyse you...";
    processImage(function (file) {
        // Get emotions based on image
        sendEmotionRequest(file, function (emotionScores) {
            // Find out most dominant emotion
            currentMood = getCurrMood(emotionScores); //this is where we send out scores to find out the predominant emotion
        });
        sendFaceRequest(file, function (faceAttributes) {
            currentAge = getCurrAge(faceAttributes);
            currentGender = getCurrGender(faceAttributes);
            currentTime = getTime();
            currentMenu = getMenu();
            function clock() {
                var now = new Date();
                currTime = now.getHours() + '.' + ("0" + now.getMinutes()).slice(-2);
            }
            clock();
            changeUI();
        });
    });
});
function processImage(callback) {
    var file = imgSelector.files[0]; //get(0) is required as imgSelector is a jQuery object so to get the DOM object, its the first item in the object. files[0] refers to the location of the photo we just chose.
    var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file); //used to read the contents of the file
    }
    else {
        console.log("Invalid file");
    }
    reader.onloadend = function () {
        //After loading the file it checks if extension is jpg or png and if it isnt it lets the user know.
        if (!file.name.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
            pageheader.innerHTML = "Please upload an image file (jpg or png).";
        }
        else {
            //if file is photo it sends the file reference back up
            callback(file);
        }
    };
}
function changeUI() {
    //Show detected mood
    if (currentTime != morning && currentMood.name == "sad") {
        pageheader.innerHTML = currentMood.message;
    }
    else {
        pageheader.innerHTML = "";
    }
    //var imgAge : HTMLImageElement = <HTMLImageElement>  $("#selected-img")[0];
    var imgMenu = $("#selected-img-menu")[0];
    var imgToy = $("#selected-img-toy")[0];
    imgMenu.style.display = "block"; //just some formating of the menu's location
    if (currentToy != null) {
        imgToy.style.display = "block";
        imgToy.src = currentToy.view;
        currentToy = null;
    }
    else {
        imgToy.style.display = "none";
    }
    pageheader4.innerHTML = currentMenu.name + ": click on an item below to order";
    imgMenu.src = currentMenu.view;
    //Remove offset at the top
    pagecontainer.style.marginTop = "20px";
    mainButton.style.display = "none";
    var orderNumber = Math.floor((Math.random() * 100) + 1);
    imgMenu.onclick = function () {
        imgToy.style.display = "none";
        imgMenu.style.display = "none";
        pageheader2.style.display = "none";
        pageheader4.style.display = "none";
        pageheader.innerHTML = "Your order has been placed<br><br> Your order number is " + orderNumber;
        //Change message after 3 seconds
        setTimeout(function () {
            pagecontainer.style.marginTop = "150px";
            pageheader.innerHTML = "Enjoy your meal!";
        }, 3000);
        //Reload page after 2 seconds
        setTimeout(function () {
            location.reload();
        }, 5000);
    };
    pageheader2.innerHTML = "Our analysis shows that your mood is " + currentMood.name +
        ",<br>You are " + currentAgeYears + " years old,<br> and you are " + currentGender.name + ".";
}
// Face API call
function sendFaceRequest(file, callback) {
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
        if (data.length != 0) {
            // Get the emotion scores
            var faceAttributes = data[0].faceAttributes;
            callback(faceAttributes);
        }
        else {
            pageheader.innerHTML = "Hmm, we can't detect a human face in that photo. Please try another?";
        }
    })
        .fail(function (error) {
        pageheader.innerHTML = "Sorry, something went wrong. Please try again later.";
        console.log(error.getAllResponseHeaders());
    });
}
// Emotion API call
function sendEmotionRequest(file, callback) {
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
        if (data.length != 0) {
            // Get the emotion scores
            var scores = data[0].scores;
            callback(scores);
        }
        else {
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
var Mood = (function () {
    function Mood(mood, sentence) {
        this.mood = mood;
        this.sentence = sentence;
        this.name = mood;
        this.message = sentence;
    }
    return Mood;
}());
var Age = (function () {
    function Age(age, emojiurl) {
        this.age = age;
        this.emojiurl = emojiurl;
        this.name = age;
        this.emoji = emojiurl;
    }
    return Age;
}());
var Gender = (function () {
    function Gender(gender, emojiurl) {
        this.gender = gender;
        this.emojiurl = emojiurl;
        this.name = gender;
        this.emoji = emojiurl;
    }
    return Gender;
}());
var Time = (function () {
    function Time(time, emojiurl) {
        this.time = time;
        this.emojiurl = emojiurl;
        this.name = time;
        this.emoji = emojiurl;
    }
    return Time;
}());
var Menu = (function () {
    function Menu(menu, viewurl) {
        this.menu = menu;
        this.viewurl = viewurl;
        this.name = menu;
        this.view = viewurl;
    }
    return Menu;
}());
var Toy = (function () {
    function Toy(toy, viewurl) {
        this.toy = toy;
        this.viewurl = viewurl;
        this.name = toy;
        this.view = viewurl;
    }
    return Toy;
}());
var happy = new Mood("happy", "http://emojipedia-us.s3.amazonaws.com/cache/a0/38/a038e6d3f342253c5ea3c057fe37b41f.png");
var sad = new Mood("sad", "You seem sad  <img width='30px' src='https://cdn.shopify.com/s/files/1/1061/1924/files/Sad_Face_Emoji.png?9898922749706957214'/>  Cheer yourself up with some dessert!");
var angry = new Mood("angry", "https://cdn.shopify.com/s/files/1/1061/1924/files/Very_Angry_Emoji.png?9898922749706957214");
var neutral = new Mood("neutral", "https://cdn.shopify.com/s/files/1/1061/1924/files/Neutral_Face_Emoji.png?9898922749706957214");
var male = new Gender("male", "images/menu/boy.png");
var female = new Gender("female", "images/menu/girl.png");
var child = new Age("child", "images/menu/kids.png");
var adult = new Age("adult", "images/menu/burger.png");
var morning = new Time("morning", "images/menu/breakfast.png");
var day = new Time("day", "images/menu/burger.png");
var breakfast = new Menu("Breakfast Menu", "images/menu/breakfast.png");
var burger = new Menu("Burger Menu", "images/menu/burger.png");
var dessert = new Menu("Dessert Menu", "images/menu/dessert.png");
var kids = new Menu("Kids Menu", "images/menu/kids.png");
var boy = new Toy("boy", "images/menu/boy.png");
var girl = new Toy("girl", "images/menu/girl.png");
// any type as the scores values is from the project oxford api request (so we dont know the type)
function getCurrMood(scores) {
    // In a practical sense, you would find the max emotion out of all the emotions provided. However we'll do the below just for simplicity's sake :P
    if (scores.happiness > 0.4) {
        currentMood = happy;
    }
    else if (scores.sadness > 0.4) {
        currentMood = sad;
    }
    else if (scores.anger > 0.4) {
        currentMood = angry;
    }
    else {
        currentMood = neutral;
    }
    return currentMood;
}
function getCurrAge(faceAttributes) {
    if (faceAttributes.age > 10) {
        currentAge = adult;
    }
    else {
        currentAge = child;
    }
    currentAgeYears = Math.round(faceAttributes.age);
    return currentAge;
}
function getCurrGender(faceAttributes) {
    if (faceAttributes.gender == "male") {
        currentGender = male;
    }
    else if (faceAttributes.gender == "female") {
        currentGender = female;
    }
    return currentGender;
}
function getTime() {
    var t = parseFloat(currTime);
    //if (t > 5.5 && t < 10.5) {
    if (t < 10.31 && t > 5.30) {
        currentTime = morning;
    }
    else {
        currentTime = day;
    }
    return currentTime;
}
function getMenu() {
    if (currentTime.name == "morning") {
        currentMenu = breakfast;
    }
    else if (currentAge.name == "adult") {
        if (currentMood.name == "sad") {
            currentMenu = dessert;
        }
        else {
            currentMenu = burger;
        }
    }
    else if (currentAge.name == "child") {
        currentMenu = kids;
        if (currentGender.name == "male") {
            currentToy = boy;
        }
        else if (currentGender.name == "female") {
            currentToy = girl;
        }
    }
    return currentMenu;
}
