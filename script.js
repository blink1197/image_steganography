const downloadButton = document.getElementById('downloadImage');
const embedRadioButton = document.getElementById('embed');
const extractRadioButton = document.getElementById('extract');
const submitButton = document.getElementById('submit');
const inputMessageContainer = document.getElementById("input-message");

let fileName = '';
let numberOfPixels;
let messageBinaryString;
let messageBinaryStringArray;
let secretCode;
let message;


function handleModeChange() {
    if (document.getElementById('embed').checked) {
        inputMessageContainer.classList.remove('hide');
        downloadButton.classList.remove('hide');
    } else if (document.getElementById('extract').checked) {
        inputMessageContainer.classList.add('hide');
        downloadButton.classList.add('hide');
    }
}




function handleImageUpload() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image file.');
        return;
    }

    fileName = file.name;

    const reader = new FileReader();
    reader.onload = function(event) {
        const imageData = event.target.result;
        localStorage.setItem(fileName, imageData);
    };
    reader.readAsDataURL(file);
}


function downloadImage() {
    const imageData = localStorage.getItem(fileName);
    if (imageData) {
        const downloadLink = document.createElement('a');
        downloadLink.href = imageData;
        downloadLink.download = 'image-embedded.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } else {
        alert('No image available in local storage.');
    }
}


function stringToBinary(str) {
    let binary = '';
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i).toString(2);
        binary += '0'.repeat(8 - charCode.length) + charCode;
    }
    return binary;
}


function binaryToString(binary) {
    let str = '';
    for (let i = 0; i < binary.length; i += 8) {
        let byte = binary.substr(i, 8);
        str += String.fromCharCode(parseInt(byte, 2));
    }
    return str;
}


function getMessageAndCode() {
    message = document.getElementById("message").value;
    messageBinaryString =  stringToBinary(message);
    messageBinaryStringArray = messageBinaryString.split("");
    secretCode = document.getElementById("secret").value;
}


function manipulateImage() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    var fileInput = document.getElementById('imageUpload');
    var img = new Image();

    var reader = new FileReader();
    reader.onload = function(event) {
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        var data_copy = data;
        

        numberOfPixels = data.length

        console.log(messageBinaryStringArray);
        const pixels = selectNumbers(numberOfPixels, messageBinaryString.length, secretCode)
        console.log(pixels);


        for (let pixel of pixels) {
            console.log(data[pixel]);
        }


        let i = 0;
        
        for (let pixel of pixels) {

            if (messageBinaryStringArray[i] == '1' && data[pixel] % 2 == 0) {
                data_copy[pixel] = data[pixel] + 1;
            } else if  (messageBinaryStringArray[i] == '1' && data[pixel] % 2 == 1){
                data_copy[pixel] = data[pixel]
            } else if (messageBinaryStringArray[i] == '0' && data[pixel] % 2 == 0) {
                data_copy[pixel] = data[pixel]
            } else if (messageBinaryStringArray[i] == '0' && data[pixel] % 2 == 1) {
                if (data[pixel] == 255) {
                    data_copy[pixel] = data[pixel] - 1;
                }
                data_copy[pixel] = data[pixel] + 1;
            }

            i ++;
            console.log(data_copy[pixel]);
        }
        //console.log(data_copy)
      };
      img.src = event.target.result;
    };

    // Read uploaded image as data URL
    reader.readAsDataURL(fileInput.files[0]);
}


function selectNumbers(N, M, seed) {
    // Generate a numeric seed from the string using a hash function
    const numericSeed = stringToSeed(seed);

    // Initialize the pseudo-random number generator with the numeric seed
    const rng = new Math.seedrandom(numericSeed);

    let numbers = [];
    for (let i = 1; i <= N; i++) {
        numbers.push(i);  
    }
    // Shuffle the array using Fisher-Yates algorithm with the initialized PRNG
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    // Select the first M numbers from the shuffled array
    let selectedNumbers = numbers.slice(0, M);
    return selectedNumbers;
}

// Function to convert a string to a numeric seed
function stringToSeed(str) {
    let seed = 0;
    for (let i = 0; i < str.length; i++) {
        seed += str.charCodeAt(i);
    }
    return seed;
}



function divideStringIntoGroups(str) {
    let nibbles = [];
    for (let i = 0; i < str.length; i += 4) {
        nibbles.push(str.substring(i, i + 4));
    }
    return nibbles;
}




  



downloadButton.addEventListener("click", downloadImage);
embedRadioButton.addEventListener("change", handleModeChange);
extractRadioButton.addEventListener("change", handleModeChange);
submitButton.addEventListener("click", function() {
    handleImageUpload();
    getMessageAndCode();
    manipulateImage();
});