let promptText = document.getElementById("prompt");
let chatContainer = document.querySelector('.chat-container');
let imageBtn = document.querySelector("#imageBtn");
let dynamicImg = document.querySelector("#imageBtn img");
let imageInput = document.querySelector("#imageBtn input");
let sendBtn = document.querySelector("#sendBtn");

// require('dotenv').config();
// console.log(" here ",process.env)
const API_KEY = "API-KEY-HERE"; //google gemini api key.
const API_URL = `API-URL-HERE`; //google gemini api url.

// we will make user obj because data can be either text or file 
let user = {
    prompt_message:null,
    file:{
        mime_type:null,
        data:null,
    }
}

async function generateAiResponse(aiChatBox){
    let text = aiChatBox.querySelector('.ai-chat-area'); // this is done to replace the loading with ai result.
    // config for fetching api.
    let RequestOption = {
        method:"Post",
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify({
            "contents":[
                {"parts":[{"text":user.prompt_message}, (user.file.data?[{"inline_data":user.file}]:[])]
            }] // this is from google gemini api doc, it is handling both text input and image input, since user file is passed under inline_data that's we are using inline_data.
        })
    }
    // this is post method so we need to mention it ,we make a request variable nd tell the things above mentioned.
    try{
        let response = await fetch(API_URL, RequestOption);
        let data = await response.json();
        let aiResponse = data.candidates[0].content.parts[0].text;  
        text.innerHTML = aiResponse;      
    }
    catch(error){
        console.log(error);
    }
    finally{
    chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"});
    dynamicImg.src = `assets/upload_img.svg`;
    dynamicImg.classList.remove('chosen-one-img');
    user.file = {};
    }
}

// creating a fn that will create chatbox for user/ai dynamically.
function createChatBox(html, classes){
    let div = document.createElement('div');
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

// creating a fn to handle user chat response
function chatResponseHandler(message){
    user.prompt_message=message;
    let html = `<img src="assets/user.png" id="userImg" width="5%">
            <div class="user-chat-area">
                ${user.prompt_message}
                ${user.file.data?`<img src="data:${user.file.mime_type};base64,${user.file.data}" class="choose-img" />` : ""}
            </div>`;
            // under src we are giving url, if there is some user.file.data then create an img tag and in src give image url.
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    // making autoscroll to upwards
    chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"}); 
    /*
    scrollTo -> we can define from where to where we want to scroll
    top:chatContainer.scrollHeight -> from top to chatContainer height. and de
    behavior:"smooth" -> define behaviour smooth.
    */

    setTimeout(() => {
        let html = `<img src="assets/ai.png" id="aiImg" width="4.4%">
                <div class="ai-chat-area">
                    <img src="assets/loading.gif" id="loading" width="45">
                </div>`;
        let aiChatBox = createChatBox(html, 'ai-chat-box')
        chatContainer.appendChild(aiChatBox);
        generateAiResponse(aiChatBox);
    }, 200)
}

promptText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    chatResponseHandler(promptText.value);
    promptText.value = "";
  }
});

sendBtn.addEventListener('click', () => {
    chatResponseHandler(promptText.value);
    promptText.value = "";
})
// now making an change event that effect in image input
imageInput.addEventListener('change', () => {
    let file = imageInput.files[0]
    // console.log(file);
    if(!file) return; // if there is no file then simply return.
    // now we will make object for fileReader
    let reader = new FileReader();
    reader.onload= (e) => {
        let base64_string = e.target.result.split(",")[1]; // 0th index was containing type and first index contains base64 code.
        user.file={
            mime_type:file.type,
            data:base64_string,
        }
        dynamicImg.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        dynamicImg.classList.add('chosen-one-img');
    }
    // now for reader to read url
    reader.readAsDataURL(file);
})

imageBtn.addEventListener('click', () => {
    imageInput.click()
})
