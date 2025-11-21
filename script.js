const menus = {
    korean: [
        {
            name: '김치찌개',
            emoji: '🍲',
            category: '한식'
        }, {
            name: '된장찌개',
            emoji: '🥘',
            category: '한식'
        }, {
            name: '비빔밥',
            emoji: '🍚',
            category: '한식'
        }, {
            name: '불고기',
            emoji: '🥩',
            category: '한식'
        }, {
            name: '삼겹살',
            emoji: '🥓',
            category: '한식'
        }, {
            name: '냉면',
            emoji: '🍜',
            category: '한식'
        }, {
            name: '칼국수',
            emoji: '🍝',
            category: '한식'
        }, {
            name: '김밥',
            emoji: '🍱',
            category: '한식'
        }
    ],
    chinese: [
        {
            name: '짜장면',
            emoji: '🍜',
            category: '중식'
        }, {
            name: '짬뽕',
            emoji: '🍲',
            category: '중식'
        }, {
            name: '탕수육',
            emoji: '🍖',
            category: '중식'
        }, {
            name: '마라탕',
            emoji: '🌶️',
            category: '중식'
        }, {
            name: '볶음밥',
            emoji: '🍚',
            category: '중식'
        }
    ],
    japanese: [
        {
            name: '초밥',
            emoji: '🍣',
            category: '일식'
        }, {
            name: '라멘',
            emoji: '🍜',
            category: '일식'
        }, {
            name: '돈까스',
            emoji: '🍛',
            category: '일식'
        }, {
            name: '우동',
            emoji: '🍲',
            category: '일식'
        }, {
            name: '규동',
            emoji: '🍱',
            category: '일식'
        }
    ],
    western: [
        {
            name: '파스타',
            emoji: '🍝',
            category: '양식'
        }, {
            name: '피자',
            emoji: '🍕',
            category: '양식'
        }, {
            name: '스테이크',
            emoji: '🥩',
            category: '양식'
        }, {
            name: '햄버거',
            emoji: '🍔',
            category: '양식'
        }, {
            name: '샐러드',
            emoji: '🥗',
            category: '양식'
        }
    ]
};

let currentFilter = 'all';
let todayCount = 0;
let recentMenusList = [];

// 날짜 표시
const today = new Date();
const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
document
    .getElementById('currentDate')
    .textContent = dateStr;

// 전체 메뉴 수 계산
const totalMenuCount = Object
    .values(menus)
    .flat()
    .length;
document
    .getElementById('totalMenus')
    .textContent = totalMenuCount;

// 카테고리별 메뉴 수 표시
document
    .getElementById('koreanCount')
    .textContent = menus.korean.length + '개';
document
    .getElementById('chineseCount')
    .textContent = menus.chinese.length + '개';
document
    .getElementById('japaneseCount')
    .textContent = menus.japanese.length + '개';
document
    .getElementById('westernCount')
    .textContent = menus.western.length + '개';

// 필터 버튼
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn
            .classList
            .add('active');
        currentFilter = btn.dataset.filter;
    });
});

// 추천 버튼
const recommendBtn = document.getElementById('recommendBtn');
const recommendResult = document.getElementById('recommendResult');

recommendBtn.addEventListener('click', () => {
    recommendBtn.disabled = true;

    let count = 0;
    const interval = setInterval(() => {
        const randomMenu = getRandomMenu();
        displayRecommendation(randomMenu);
        count++;

        if (count >= 15) {
            clearInterval(interval);
            recommendBtn.disabled = false;

            // 통계 업데이트
            todayCount++;
            document
                .getElementById('todayCount')
                .textContent = todayCount;

            // 최근 메뉴에 추가
            addToRecentMenus(randomMenu);
        }
    }, 80);
});

function getRandomMenu() {
    let menuList = [];

    if (currentFilter === 'all') {
        menuList = Object
            .values(menus)
            .flat();
    } else {
        menuList = menus[currentFilter];
    }

    return menuList[Math.floor(Math.random() * menuList.length)];
}

function displayRecommendation(menu) {
    recommendResult.innerHTML = `
        <div class="recommend-emoji">${menu.emoji}</div>
        <div class="recommend-name">${menu.name}</div>
        <div class="recommend-category">${menu.category}</div>
    `;
}

function addToRecentMenus(menu) {
    recentMenusList.unshift(menu);
    if (recentMenusList.length > 5) {
        recentMenusList.pop();
    }

    const recentMenusEl = document.getElementById('recentMenus');
    recentMenusEl.innerHTML = recentMenusList
        .map(
            m => `<li class="menu-list-item">
            <span>${m.emoji} ${m.name}</span>
            <span>${m.category}</span>
        </li>`
        )
        .join('');
}