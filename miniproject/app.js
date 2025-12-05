// 核心數據變數：將從 JSON 載入所有職業資料
let allJobData = {};

// --- 函數 1：渲染單一技能卡片 ---
function renderSkillCard(skill) {
    // 使用模板字符串生成技能卡片的HTML
    return `
        <div class="skill-card">
            <div class="skill-header">
                <img src="${skill.icon_url || 'default_icon.png'}" alt="${skill.name_tw}" class="skill-icon">
                <h4>${skill.name_tw}</h4>
            </div>
            <div class="skill-details">
                <p><strong>等級要求:</strong> ${skill.level}</p>
                <p><strong>類型:</strong> <span class="skill-type type-${skill.type}">${skill.type}</span></p>
                <p><strong>威力 (Potency):</strong> ${skill.potency > 0 ? skill.potency : '—'}</p>
                <p class="effect-desc">${skill.effect_tw}</p>
            </div>
        </div>
    `;
}


// --- 函數 2：根據職業數據渲染主內容頁面 ---
function renderJobPage(jobKey) {
    const job = allJobData[jobKey];
    const skillListContainer = document.getElementById('skill-list-container');

    // 檢查數據是否存在
    if (!job) {
        document.getElementById('main-content').innerHTML = '<h2>404 職業資料未找到</h2>';
        return;
    }

    // 1. 更新職業標題和描述
    document.getElementById('job-title').textContent = `${job.name_tw} (${jobKey})`;
    document.getElementById('job-description').textContent = job.description_tw;

    // 2. 動態生成技能卡片列表
    let skillsHtml = '';

    job.skills.forEach(skill => {
        skillsHtml += renderSkillCard(skill);
    });

    skillListContainer.innerHTML = skillsHtml;

    // 3. (可選) 高亮當前選擇的導航項目
    document.querySelectorAll('#job-list a').forEach(a => {
        if (a.getAttribute('href') === `#${jobKey}`) {
            a.classList.add('active-job');
        } else {
            a.classList.remove('active-job');
        }
    });
}


// --- 函數 3：動態更新側邊欄導航 ---
function updateSidebarNav(data) {
    const jobListElement = document.getElementById('job-list');
    jobListElement.innerHTML = ''; // 清空現有列表

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const job = data[key];
            const listItem = document.createElement('li');

            // 點擊後會改變 URL Hash，觸發 hashchange 事件
            listItem.innerHTML = `<a href="#${key}">${job.name_tw} (${key})</a>`;
            jobListElement.appendChild(listItem);
        }
    }
}

// --- 函數 4：處理 URL Hash 變化 (路由處理) ---
function handleHashChange() {
    const jobKey = window.location.hash.substring(1);

    if (jobKey && allJobData[jobKey]) {
        renderJobPage(jobKey);
    } else if (Object.keys(allJobData).length > 0) {
        // 如果 Hash 不存在或無效，則預設載入第一個職業
        const defaultJobKey = Object.keys(allJobData)[0];
        window.location.hash = defaultJobKey;
        // renderJobPage(defaultJobKey); // hashchange 事件會再次觸發，無需重複調用
    }
}


// --- 核心函數：應用程式初始化 ---
async function initApp() {

    // 1. 數據載入步驟
    try {
        const response = await fetch('jobs.json');

        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}。`);
        }

        allJobData = await response.json();

        console.log('JSON 數據載入成功');

        // 2. 載入成功後，更新側邊欄並處理路由
        updateSidebarNav(allJobData);

        // 3. 監聽 Hash 變化 (模擬 SPA 路由)
        window.addEventListener('hashchange', handleHashChange);

        // 4. 頁面初次載入時執行路由判斷
        handleHashChange();

    } catch (error) {
        console.error('載入或解析 JSON 失敗:', error);
        document.getElementById('main-content').innerHTML = `
            <h2>資料載入錯誤</h2>
            <p>無法載入職業技能資料。請確認檔案 **'data/jobs.json'** 存在且格式正確。詳情請查看控制台 (Console)。</p>
        `;
    }
}

// 應用程式啟動點
document.addEventListener('DOMContentLoaded', initApp);