let userPassword = "";
let db;

const request = indexedDB.open("secretPhotoDB", 1);

request.onupgradeneeded = function (e) {
    db = e.target.result;
    db.createObjectStore("photos", {
        keyPath: "id",
        autoIncrement: true
    });
};

request.onsuccess = function (e) {
    db = e.target.result;
};

function login() {
    userPassword = document
        .getElementById("password-input")
        .value;

    if (!userPassword) {
        alert("비밀번호를 입력해주세요.");
        return;
    }

    document
        .getElementById("auth-section")
        .style
        .display = "none";
    document
        .getElementById("main-section")
        .style
        .display = "block";

    loadImages();
}

function uploadImage() {
    const file = document
        .getElementById("file-input")
        .files[0];
    if (!file) 
        return;
    
    const reader = new FileReader();
    reader.onload = function () {
        const encrypted = CryptoJS
            .AES
            .encrypt(reader.result, userPassword)
            .toString();

        const tx = db.transaction("photos", "readwrite");
        tx
            .objectStore("photos")
            .add({data: encrypted});

        tx.oncomplete = () => loadImages();
    };
    reader.readAsDataURL(file);
}

function loadImages() {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    const tx = db.transaction("photos", "readonly");
    const store = tx.objectStore("photos");

    store
        .openCursor()
        .onsuccess = function (e) {
            const cursor = e.target.result;
            if (!cursor) 
                return;
            
            const decrypted = CryptoJS
                .AES
                .decrypt(cursor.value.data, userPassword);
            const imgData = decrypted.toString(CryptoJS.enc.Utf8);

            if (imgData) {
                const img = document.createElement("img");
                img.src = imgData;

                gallery.appendChild(img);
            }

            cursor.continue();
        };
}
