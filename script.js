let db;
let userPassword = "";

// IndexedDB 생성
const request = indexedDB.open("secretPhotoDB", 1);

request.onupgradeneeded = function (e) {
    db = e.target.result;
    db.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function (e) {
    db = e.target.result;
    init();
};

function init() {
    const savedHash = localStorage.getItem("vault_password");

    if (!savedHash) {
        document.getElementById("setup-section").style.display = "block";
    } else {
        document.getElementById("login-section").style.display = "block";
    }
}

// ---------------- 비밀번호 설정 ----------------

function setPassword() {
    const p1 = document.getElementById("new-pass").value;
    const p2 = document.getElementById("new-pass2").value;

    if (!p1 || !p2) return alert("비밀번호를 입력해주세요.");
    if (p1 !== p2) return alert("비밀번호가 일치하지 않습니다.");

    const hash = CryptoJS.SHA256(p1).toString();
    localStorage.setItem("vault_password", hash);

    alert("비밀번호 설정 완료!");
    location.reload();
}

// ---------------- 로그인 ----------------

function login() {
    const input = document.getElementById("login-pass").value;
    const savedHash = localStorage.getItem("vault_password");
    const inputHash = CryptoJS.SHA256(input).toString();

    if (inputHash === savedHash) {
        userPassword = input;
        document.getElementById("login-section").style.display = "none";
        document.getElementById("main-section").style.display = "block";
        loadImages();
    } else {
        alert("비밀번호가 틀렸습니다.");
    }
}

// ---------------- 이미지 업로드 ----------------

function uploadImage() {
    const file = document.getElementById("file-input").files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
        const encrypted = CryptoJS.AES.encrypt(reader.result, userPassword).toString();

        const tx = db.transaction("photos", "readwrite");
        tx.objectStore("photos").add({ data: encrypted });

        tx.oncomplete = () => loadImages();
    };

    reader.readAsDataURL(file);
}

// ---------------- 이미지 불러오기 ----------------

function loadImages() {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    const tx = db.transaction("photos", "readonly");
    const store = tx.objectStore("photos");

    store.openCursor().onsuccess = function (e) {
        const cursor = e.target.result;
        if (!cursor) return;

        const decrypted = CryptoJS.AES.decrypt(cursor.value.data, userPassword);
        const imgData = decrypted.toString(CryptoJS.enc.Utf8);

        if (imgData) {
            const img = document.createElement("img");
            img.src = imgData;
            gallery.appendChild(img);
        }

        cursor.continue();
    };
}

// ======================================================
//                 🔐 비밀번호 변경 기능
// ======================================================

function openChangePassword() {
    document.getElementById("main-section").style.display = "none";
    document.getElementById("change-pass-section").style.display = "block";
}

function cancelChange() {
    document.getElementById("change-pass-section").style.display = "none";
    document.getElementById("main-section").style.display = "block";
}

function changePassword() {
    const oldPass = document.getElementById("old-pass").value;
    const newPass = document.getElementById("new-pass-change").value;
    const newPass2 = document.getElementById("new-pass-change2").value;

    const savedHash = localStorage.getItem("vault_password");
    const oldPassHash = CryptoJS.SHA256(oldPass).toString();

    if (oldPassHash !== savedHash) {
        return alert("현재 비밀번호가 틀렸습니다.");
    }

    if (newPass !== newPass2) {
        return alert("새 비밀번호가 일치하지 않습니다.");
    }

    // 새 비밀번호 저장
    const newHash = CryptoJS.SHA256(newPass).toString();
    localStorage.setItem("vault_password", newHash);

    // userPassword 키 변경
    userPassword = newPass;

    alert("비밀번호가 변경되었습니다!");

    // 화면 전환
    document.getElementById("change-pass-section").style.display = "none";
    document.getElementById("main-section").style.display = "block";
}
