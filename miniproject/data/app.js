// 核心數據變數：將從 JSON 載入所有職業資料
let allJobData = {};

// --- 函數 1：渲染單一技能卡片 ---
function renderSkillCard(skill) {
    // 檢查是否有連擊條件，用於決定是否顯示連擊區塊
    const hasCombo = skill.combo_req || skill.combopotency;

    // 連擊區塊的 HTML，只有在有連擊資訊時才生成
    const comboHTML = hasCombo ? `
        <div class="skill-combo">
        <h5>連擊資訊</h5>
            <p><strong>連擊條件:</strong> ${skill.combo_req || '—'}</p>
            ${skill.combopotency ? `<p><strong>連擊威力:</strong> ${skill.combopotency || '—'}</p>` : ''}
            ${skill.combo_duration ? `<p><strong>持續時間:</strong> ${skill.combo_duration || '—'}</p>` : ''}
            ${skill.comboeffect_tw ? `<p><strong>連擊成功:</strong> ${skill.comboeffect_tw || '—'}</p>` : ''}
            ${skill.comboeffect2_tw ? `<p><strong>連擊成功:</strong> ${skill.comboeffect2_tw || '—'}</p>` : ''}
        </div>
    ` : ''; // 如果沒有連擊資訊，則為空字串

    // 追加效果區塊的 HTML (新增)
    const addEffectHTML = skill.additional_effect_tw ? `
        <div class="skill-additional-effect">
            <p><strong>追加效果:</strong> ${skill.additional_effect_tw}</p>
            ${skill.add_effect_duration ? `<p><strong>持續時間:</strong> ${skill.add_effect_duration}</p>` : ''}
            ${skill.additional_effect2_tw ? `<p><strong>追加效果:</strong> ${skill.additional_effect2_tw}</p>` : ''}
            ${skill.add_effect2_duration ? `<p><strong>持續時間:</strong> ${skill.add_effect2_duration}</p>` : ''}
            ${skill.additional_effect3_tw ? `<p><strong>追加效果:</strong> ${skill.additional_effect3_tw}</p>` : ''}
            ${skill.add_effect3_duration ? `<p><strong>持續時間:</strong> ${skill.add_effect3_duration}</p>` : ''}
            ${skill.additional_effect4_tw ? `<p><strong>追加效果:</strong> ${skill.additional_effect4_tw}</p>` : ''}
            ${skill.add_effect4_duration ? `<p><strong>持續時間:</strong> ${skill.add_effect4_duration}</p>` : ''}
        </div>
    `: '';

    // 使用模板字符串生成技能卡片的HTML
    return `
        <div class="skill-card" data-skill-id="${skill.id}">
            <div class="skill-header">
                <img src="${skill.icon_url || 'default_icon.png'}" alt="${skill.name_tw}" class="skill-icon">
                <h4>${skill.name_tw}<br> <p><span class="skill-type type-${skill.type}">${skill.type}</span></p></h4>
            </div>
            
            <div class="skill-tooltip">
                <div class="skill-stats">
                    <p><strong>習得等級:</strong> ${skill.level}等</p>
                   
                    <p><strong>距離:</strong> ${skill.range || '0米'}</p>
                    <p><strong>範圍:</strong> ${skill.area || '0米'}</p>
                    <p><strong>詠唱時間:</strong> ${skill.cast_time || '即時'}</p>
                    <p><strong>冷卻時間:</strong> ${skill.cooldown || '—'}</p>
                    ${skill.cost ? `<p><strong>消耗:</strong> ${skill.cost || '—'}</p>` : ''}
                    ${skill.potency ? `<p><strong>威力:</strong> ${skill.potency || '—'}</p>` : ''}
                    ${skill.other_potency ? `<p>${skill.other_potency || '—'}</p>` : ''}
                    ${skill.cure_potency ? `<p><strong>恢復力:</strong> ${skill.cure_potency || '—'}</p>` : ''}
                    ${skill.duration ? `<p><strong>持續時間:</strong> ${skill.duration || '—'}</p > ` : ''}
                    ${skill.charge ? `<p><strong>積蓄次數:</strong> ${skill.charge || '—'}</p>` : ''}
                    ${skill.cast_req ? `<p><strong>發動條件:</strong> ${skill.cast_req || '—'}</p >` : ''}
                    <hr>
                    <p class="effect-desc">${skill.effect_tw}</p>
                    ${addEffectHTML}
                    ${skill.notice ? `<p class="notice"> ${skill.notice || '—'}</p>` : ''}
                    ${comboHTML}
                </div >
            </div >
        </div >
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
    // 5. 附加懸停監聽器
    attachTooltipListeners();
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



let hideTimeout;
const HIDE_DELAY = 100; // 延遲 100 毫秒才隱藏

function attachTooltipListeners() {
    const skillCards = document.querySelectorAll('.skill-card');
    const TOOLTIP_WIDTH = 300; // 必須與 CSS 寬度匹配

    skillCards.forEach(card => {
        // -------------------------
        // 1. 滑鼠進入 (mouseover)
        // -------------------------
        card.addEventListener('mouseover', function () {
            // 清除任何待處理的隱藏延遲，防止閃爍
            clearTimeout(hideTimeout);

            // --- 自動判斷定位邏輯 (維持不變) ---
            const rect = this.getBoundingClientRect();
            if (rect.right + TOOLTIP_WIDTH > window.innerWidth) {
                this.classList.add('left-side');
            } else {
                this.classList.remove('left-side');
            }
            // --- 自動判斷定位邏輯 (結束) ---

            // 顯示提示框
            this.classList.add('active');
        });

        // -------------------------
        // 2. 滑鼠離開 (mouseout)
        // -------------------------
        card.addEventListener('mouseout', function () {
            // 設置延遲隱藏：給予滑鼠短暫的時間移出 Tooltip 區域或移回卡片本身
            hideTimeout = setTimeout(() => {
                this.classList.remove('active');
                this.classList.remove('left-side');
            }, HIDE_DELAY);
        });

        // -------------------------
        // 3. 處理 Tooltip 本身 (防止離開 Tooltip 時閃爍)
        // -------------------------
        const tooltip = card.querySelector('.skill-tooltip');

        // 確保滑鼠進入 Tooltip 區域時，不要觸發隱藏
        if (tooltip) {
            tooltip.addEventListener('mouseover', function () {
                // 如果滑鼠指標進入 Tooltip，則取消隱藏延遲
                clearTimeout(hideTimeout);
            });

            tooltip.addEventListener('mouseout', function () {
                // 如果滑鼠指標離開 Tooltip，則重新啟動隱藏延遲
                hideTimeout = setTimeout(() => {
                    card.classList.remove('active');
                    card.classList.remove('left-side');
                }, HIDE_DELAY);
            });
        }
    });
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
        const response = await fetch('./data/jobs.json');

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
    < h2 > 資料載入錯誤</h2 >
        <p>無法載入職業技能資料。請確認檔案 **'data/jobs.json'** 存在且格式正確。詳情請查看控制台 (Console)。</p>
`;
    }
}

// 應用程式啟動點
document.addEventListener('DOMContentLoaded', initApp);