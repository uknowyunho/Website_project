let db;
let userPassword = "";

// DB 생성
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
    init();
};

// 초기 실행
function init() {
    const savedHash = localStorage.getItem("vault_password");

    if (!savedHash) {
        // 비밀번호 설정 페이지 표시
        document
            .getElementById("setup-section")
            .style
            .display = "block";
    } else {
        // 로그인 페이지 표시
        document
            .getElementById("login-section")
            .style
            .display = "block";
    }
}

// ----------- 비밀번호 설정 -----------

function setPassword() {
    const p1 = document
        .getElementById("new-pass")
        .value;
    const p2 = document
        .getElementById("new-pass2")
        .value;

    if (!p1 || !p2) 
        return alert("비밀번호를 입력해주세요.");
    if (p1 !== p2) 
        return alert("비밀번호가 서로 다릅니다.");
    
    // 비밀번호 해시 저장
    const hash = CryptoJS
        .SHA256(p1)
        .toString();
    localStorage.setItem("vault_password", hash);

    alert("비밀번호 설정 완료!");
    location.reload();
}

// ----------- 로그인 -----------

function login() {
    const input = document
        .getElementById("login-pass")
        .value;
    const savedHash = localStorage.getItem("vault_password");

    const inputHash = CryptoJS
        .SHA256(input)
        .toString();

    if (inputHash === savedHash) {
        userPassword = input;
        document
            .getElementById("login-section")
            .style
            .display = "none";
        document
            .getElementById("main-section")
            .style
            .display = "block";
        loadImages();
    } else {
        alert("비밀번호가 틀렸습니다.");
    }
}

// ----------- 이미지 업로드 & 암호화 -----------

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

// ----------- 이미지 불러오기 -----------

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
