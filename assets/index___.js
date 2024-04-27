(function () {
    const supportsModulePreload = document.createElement("link").relList;
    if (supportsModulePreload && supportsModulePreload.supports && supportsModulePreload.supports("modulepreload"))
        return;
    for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
        processLink(link);
    }
    new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === "childList") {
                for (const node of mutation.addedNodes) {
                    if (node.tagName === "LINK" && node.rel === "modulepreload") {
                        processLink(node);
                    }
                }
            }
        }
    }).observe(document, {
        childList: true,
        subtree: true
    });
    function getFetchOptions(link) {
        const options = {};
        if (link.integrity)
            options.integrity = link.integrity;
        if (link.referrerPolicy)
            options.referrerPolicy = link.referrerPolicy;
        switch (link.crossOrigin) {
        case "use-credentials":
            options.credentials = "include";
            break;
        case "anonymous":
            options.credentials = "omit";
            break;
        default:
            options.credentials = "same-origin";
        }
        return options;
    }
    function processLink(link) {
        if (link.ep)
            return;
        link.ep = true;
        const options = getFetchOptions(link);
        fetch(link.href, options);
    }
})();


const editor1 = document.querySelector(".editor-1"), 
editor2 = document.querySelector(".editor-2"), 
textareas = document.querySelectorAll("[data-textarea]"), 
textInput = document.getElementById("text-input"), 
hashOutput = document.getElementById("hash-output"), 
fileOutput = document.getElementById("file-hash-output"), 
clearBtn = document.getElementById("clear-btn"), 
convertBtn = document.getElementById("convert-btn"), 
convertFileBtn = document.getElementById("convert-btn-file"), 
pastTextBtn = document.querySelector(".past-text-btn"), 
textareaCopy = document.querySelector("[data-textarea-copy]"), 
moreItemsLabel = document.querySelector(".more-items-label"), 
inputOverlay = document.querySelector(".input-overlay");



function updateConvertBtnText() {
    const textHashInput = document.getElementById("text-hash-input");
    const convertBtnText = document.getElementById("convert-btn-text");

    if (textHashInput.value.trim() !== "") {
        convertBtnText.removeAttribute("disabled");
    } else {
        convertBtnText.setAttribute("disabled", "");
    }
}

// Добавить обработчик события на изменение поля ввода
document.getElementById("text-hash-input").addEventListener("input", updateConvertBtnText);




// Получить ссылки на необходимые элементы
const textHashInput = document.getElementById("text-hash-input");
const textHashOutput = document.getElementById("text-hash-output");
const convertBtnText = document.getElementById("convert-btn-text");

// Добавить обработчик для кнопки
convertBtnText.addEventListener("click", async () => {
    if (!convertBtnText.getAttribute("disabled")) {
        const textValue = textHashInput.value.trim();
        const hash = (await calculateHash([textValue]))[0];
        textHashOutput.value = hash;
    }
});


function copyHashToClipboard() {
    const hashValue = hashOutput ? hashOutput.value : undefined;
    if (hashValue) {
        navigator.clipboard.writeText(hashValue);
    }
}
async function calculateHash(textArray) {
    const encoder = new TextEncoder;
    return await Promise.all(textArray.filter(item => item !== "").map(async item => {
            await new Promise(resolve => setTimeout(resolve, 10));
            const encoded = encoder.encode(item);
            const digest = await crypto.subtle.digest("SHA-256", encoded);
            return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
        }));
}
async function calculateHashFromBuffer(buffer) {
    try {
        const digest = await crypto.subtle.digest("SHA-256", buffer);
        const hash = Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
        return hash;
    } catch (error) {
        throw new Error('Failed to calculate hash from buffer.');
    }
}
function resizeTextarea(textarea) {
    textarea.style.height = "100%";
    textarea.style.height = (textarea.scrollHeight < 700 ? 800 : textarea.scrollHeight) + "px";
    textarea.style.minWidth = "auto";
    textarea.style.minWidth = textarea.scrollWidth + "px";
}
function updateLineNumbers(textarea) {
    const container = textarea.closest("[data-editor-container]");
    const editorTextarea = container ? container.querySelector("textarea") : undefined;
    const lineNumbersContainer = container ? container.querySelector("[data-line-numbers]") : undefined;
    if (!editorTextarea || !lineNumbersContainer) {
        console.error("Editor or line numbers container not found!");
        return;
    }
    const lines = editorTextarea.value.split("\n");
    let lineNumbersText = "";
    for (let i = 1; i <= lines.length; i++) {
        lineNumbersText += `${i}\n`;
    }
    lineNumbersContainer.textContent = lineNumbersText;
}
function updateMoreItemsLabel(count) {
    if (moreItemsLabel) {
        if (!count) {
            moreItemsLabel.classList.remove("active");
        } else {
            moreItemsLabel.classList.add("active");
            moreItemsLabel.textContent = `And another ${count} elements...`;
        }
    }
}
let textData;
function updateTextInput(text) {
    if (inputOverlay) {
        inputOverlay.classList.add("active");
        textData = text.split("");
        if (textData.length <= 200) {
            textInput.value = text;
            updateMoreItemsLabel();
        } else {
            const slicedText = textData.slice(0, 200);
            textInput.value = slicedText.join("");
            const remainingCount = textData.length - slicedText.length;
            updateMoreItemsLabel(remainingCount);
        }
        updateLineNumbers(textInput);
        resizeTextarea(textInput);
        convertBtn.disabled = false;
        if (editor1.scrollHeight > editor1.clientHeight) {
            editor1.scrollTop = editor1.scrollHeight;
        }
    }
}
function updateConvertBtn() {
    convertBtn.disabled = !textInput.value;
}
async function convertTextToHash() {
    if (convertBtn.getAttribute("disable"))
        return;
    convertBtn.setAttribute("disabled", "");
    let textArray;
    if (inputOverlay.classList.contains("active")) {
        textArray = textData;
    } else {
        textArray = textInput.value.split("");
    }
    const hash = (await calculateHash(textArray)).join("");
    hashOutput.value = hash;
    updateLineNumbers(hashOutput);
    resizeTextarea(hashOutput); /*editor2.scrollTop = editor2.scrollHeight;*/ if (editor2.scrollHeight > editor2.clientHeight) {
        editor2.scrollTop = editor2.scrollHeight;
    }
}
async function convertFileToHash(buffer) {
    try {
        const hash = await calculateHashFromBuffer(buffer);
        setTimeout(() => {
		       fileOutput.value = hash;
			   convertFileBtn.addAttribute("disabled");
        }, 0);
        return hash;
    } catch (error) {
        throw new Error('Failed to convert buffer to hash.');
    }
}
async function readFileAsBinary(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        return arrayBuffer;
    } catch (error) {
        throw new Error('Failed to read file as binary.');
    }
}
document.addEventListener("DOMContentLoaded", () => {
	
    const fileInput = document.getElementById("file-input");
    fileInput.addEventListener("click", () => {
        //clearBtn.click();
		//convertFileBtn.addAttribute("disabled");
		 fileOutput.value = '';
		 			   convertFileBtn.addAttribute("disabled");
    });
	
    fileInput.addEventListener("change", async(event) => {
        const file = event.target.files[0];
        if (file) {
			convertFileBtn.removeAttribute("disabled");
        }
    });
	


    // Обработчик для кнопки convert-btn-file
    convertFileBtn.onclick = async () => {
        const file = fileInput.files[0];
        if (file) {
            const binaryData = await readFileAsBinary(file);
            const hash = await convertFileToHash(binaryData);
        }
    };
	

	
    if (textareas) {
        textareas.forEach(textarea => {
            updateLineNumbers(textarea);
            textarea.addEventListener("input", () => {
                updateLineNumbers(textInput);
                resizeTextarea(textInput);
                updateConvertBtn();
            });
        });
    }
    clearBtn.onclick = () => {
        textInput.value = "";
        hashOutput.value = "";
        /*fileInput.value = "";*/
        inputOverlay.classList.remove("active");
        updateLineNumbers(textInput);
        resizeTextarea(textInput);
        updateLineNumbers(hashOutput);
        resizeTextarea(hashOutput);
        updateMoreItemsLabel();
        updateConvertBtn();
    };
    convertBtn.onclick = convertTextToHash;
	
	
	
	  //  convertFileBtn.onclick = convertTextToHash;
		
		
    textInput.addEventListener("paste", async event => {
        event.preventDefault();
        const clipboardData = (event.clipboardData) ? event.clipboardData.getData("text") : "";
        textInput.blur();
        updateTextInput(clipboardData);
    });
    pastTextBtn.onclick = async() => {
        try {
            textInput.value = "";
            const clipboardText = await navigator.clipboard.readText();
            updateTextInput(clipboardText);
        } catch (error) {
            console.error("Failed to read clipboard contents: ", error);
        }
    };
    textareaCopy.onclick = copyHashToClipboard;
});
async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}