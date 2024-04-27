const b = document.querySelector(".editor-1"),
    S = document.querySelector(".editor-2"),
    m = document.querySelectorAll("[data-textarea]"),
    r = document.getElementById("text-input"),
    i = document.getElementById("hash-output"),
    A = document.getElementById("clear-btn"),
    f = document.getElementById("convert-btn"),
    L = document.querySelector(".past-text-btn"),
    B = document.querySelector("[data-textarea-copy]"),
    l = document.querySelector(".more-items-label"),
    v = document.querySelector(".input-overlay");
	
	

    const convertFileBtn = document.getElementById("convert-btn-file"); 
    const fileOutput = document.getElementById("file-hash-output"); 
    const textHashInput = document.getElementById("text-hash-input");
    const convertBtnText = document.getElementById("convert-btn-text");
	const textHashOutput = document.getElementById("text-hash-output");	

	function updateConvertBtn() {
		convertBtn.disabled = !textInput.value;
	}

	function updateConvertBtnText() {

		if (textHashInput.value.trim() !== "") {
			convertBtnText.removeAttribute("disabled");
		} else {
			convertBtnText.setAttribute("disabled", "");
		}
	}

	// Добавить обработчик события на изменение поля ввода
	textHashInput.addEventListener("input", updateConvertBtnText);

	// Добавить обработчик для кнопки
	convertBtnText.addEventListener("click", async () => {
		if (!convertBtnText.getAttribute("disabled")) {
			const textValue = textHashInput.value.trim();
			//const hash = (await calculateHash([textValue]))[0];
			const hash = (await H([textValue]))[0];
			textHashOutput.value = hash;
		}
	});
	
	
async function calculateHashFromBuffer(buffer) {
    try {
        const digest = await crypto.subtle.digest("SHA-256", buffer);
        const hash = Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
        return hash;
    } catch (error) {
        throw new Error('Failed to calculate hash from buffer.');
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


async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}


document.addEventListener("DOMContentLoaded", () => {
	
    const fileInput = document.getElementById("file-input");
    fileInput.addEventListener("click", () => {
		 fileOutput.value = '';
			convertFileBtn.disabled=true;
    });
	
    fileInput.addEventListener("change", async(event) => {
        const file = event.target.files[0];
        if (file) {
			convertFileBtn.disabled=false;
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
	
});
/****************************/	
	
	
function E() {
    const t = i == null ? void 0 : i.value;
    t && navigator.clipboard.writeText(t);
}
async function H(t) {
    const n = new TextEncoder();
    return await Promise.all(
        t
            .filter((c) => c !== "")
            .map(async (c) => {
                await new Promise((p) => setTimeout(p, 10));
                const e = n.encode(c),
                    o = await crypto.subtle.digest("SHA-256", e);
                return Array.from(new Uint8Array(o))
                    .map((p) => p.toString(16).padStart(2, "0"))
                    .join("");
            })
    );
}
function h(t) {
    (t.style.height = "100%"), (t.style.height = (t.scrollHeight < 700 ? 800 : t.scrollHeight) + "px"), (t.style.minWidth = "auto"), (t.style.minWidth = t.scrollWidth + "px");
}
function u(t) {
    const n = t.closest("[data-editor-container]"),
        s = n == null ? void 0 : n.querySelector("textarea"),
        c = n == null ? void 0 : n.querySelector("[data-line-numbers]");
    if (!s || !c) {
        //console.error("Editor or line numbers container not found!");
        return;
    }
    const e = s.value.split(`
`);
    let o = "";
    for (let a = 1; a <= e.length; a++)
        o += `${a}
`;
    c.textContent = o;
}
function y(t) {
    if (l) {
        if (!t) {
            l == null || l.classList.remove("active");
            return;
        }
        l == null || l.classList.add("active"), (l.textContent = `And another ${t} elements...`);
    }
}
let d;
function x(t) {
    if (
        (v.classList.add("active"),
        (d = t.split(`
`)),
        d.length <= 200)
    )
        (r.value = t), y();
    else {
        const n = d.slice(0, 200);
        r.value = n.join(`
`);
        const s = d.length - n.length;
        y(s);
    }
    u(r), h(r), g(), (b.scrollTop = b.scrollHeight);
}
function g() {
    r.value ? f.removeAttribute("disabled") : f.setAttribute("disabled", "");
}
async function q() {
    if (f.getAttribute("disable")) return;
    f.setAttribute("disabled", "");
    let t;
    v.classList.contains("active")
        ? (t = d)
        : (t = r.value.split(`
`));
    const s = (await H(t)).join(`
`);
    (i.value = s), u(i), h(i)/*, (S.scrollTop = S.scrollHeight)*/;
}
document.addEventListener("DOMContentLoaded", () => {
    m == null ||
        m.forEach((t) => {
            u(t),
                t.addEventListener("input", () => {
                    u(r), h(r), g();
                });
        }),
        (A.onclick = () => {
            (r.value = ""), (i.value = ""), v.classList.remove("active"), u(r), h(r), u(i), h(i), y(), g();
        }),
        (f.onclick = q),
        r.addEventListener("paste", async (t) => {
            var s;
            t.preventDefault();
            const n = ((s = t.clipboardData) == null ? void 0 : s.getData("text")) || "";
            r.blur(), x(n);
        }),
        (L.onclick = async () => {
            try {
                r.value = "";
                const t = await navigator.clipboard.readText();
                x(t);
            } catch (t) {
                console.error("Failed to read clipboard contents: ", t);
            }
        }),
        (B.onclick = E);
});
