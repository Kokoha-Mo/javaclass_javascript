// 核心數據變數
let allJobData = {};

// --- 輔助函數：渲染單一技能卡片 ---
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
                <p><strong>威力:</strong> ${skill.potency > 0 ? skill.potency : '—'}</p>
                <p class="effect-desc">${skill.effect_tw}</p>
            </div>
        </div>
    `;
}


// --- 核心函數：根據職業數據渲染頁面 ---
function renderJobPage(jobKey) {
    const job = allJobData[jobKey];
    const contentContainer = document.getElementById('main-content');
    const skillListContainer = document.getElementById('skill-list-container');

    // 檢查數據是否存在
    if (!job) {
        contentContainer.innerHTML = '<h2>404 職業資料未找到</h2>';
        return;
    }

    // 1. 更新職業標題和描述
    document.getElementById('job-title').textContent = `${job.name_tw} (${job.role_tw})`;
    document.getElementById('job-description').textContent = job.description_tw;

    // 2. 動態生成技能卡片列表
    let skillsHtml = '';

    // 這裡可以加入排序邏輯: job.skills.sort(...)

    job.skills.forEach(skill => {
        skillsHtml += renderSkillCard(skill);
    });

    skillListContainer.innerHTML = skillsHtml;
}


// --- 步驟 3: 路由處理與數據載入 ---
async function initApp() {
    // 模擬的 JSON 數據 (實際應使用 fetch 從 data/jobs.json 載入)
    // 假設這是從 data/jobs.json 獲取的數據
    const mockData = {
        "DarkKnight": {
            "name_tw": "暗黑騎士", "role_tw": "坦克",
            "description_tw": "專注於暗影魔法的防禦者，是團隊的主力堅盾。",
            "skills": [
                { "id": "drk1", "name_tw": "吸血劍", "level": 30, "type": "戰技", "cooldown": 2.5, "potency": 200, "effect_tw": "單體傷害，並恢復部分傷害值。", "icon_url": "icons/drk/drk1.png" },
                { "id": "drk2", "name_tw": "黑盾", "level": 70, "type": "能力", "cooldown": 60, "potency": 0, "effect_tw": "吸收傷害的護盾。", "icon_url": "icons/drk/drk2.png" }
            ]
        },
        "Samurai": {
            "name_tw": "武士", "role_tw": "近戰輸出",
            "description_tw": "以刀光劍影製造連續的高爆發傷害。",
            "skills": [
                { "id": "sam1", "name_tw": "葉隱", "level": 52, "type": "能力", "cooldown": 5, "potency": 0, "effect_tw": "消耗居合點數換取劍氣。", "icon_url": "icons/sam/sam1.png" }
            ]
        }
        // ... 其他職業數據
    };

    // 實際的數據載入步驟 (假設您已建立 data/jobs.json):
    // const response = await fetch('data/jobs.json');
    // allJobData = await response.json();

    allJobData = mockData; // 使用模擬數據進行測試

    // 1. 處理 URL Hash 路由
    function handleHashChange() {
        // 獲取當前 URL 中的 Hash (例如: #DarkKnight)
        const jobKey = window.location.hash.substring(1);

        if (jobKey && allJobData[jobKey]) {
            renderJobPage(jobKey);
        } else if (Object.keys(allJobData).length > 0) {
            // 如果沒有指定 Hash，則預設載入第一個職業
            const defaultJobKey = Object.keys(allJobData)[0];
            window.location.hash = defaultJobKey;
            renderJobPage(defaultJobKey);
        }
    }

    // 2. 監聽 Hash 變化 (模擬 SPA 路由)
    window.addEventListener('hashchange', handleHashChange);

    // 3. 頁面初次載入時執行
    handleHashChange();
}

// 應用程式啟動點
document.addEventListener('DOMContentLoaded', initApp);