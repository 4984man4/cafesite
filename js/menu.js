async function loadMenu() {
  try {
    const response = await fetch('/api/menu');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const menu = await response.json();
    console.log('메뉴 로드 성공:', menu);
    renderMenuSections(menu);
  } catch (error) {
    console.error('메뉴 로드 실패:', error);
    const container = document.getElementById('menu-container');
    if (container) {
      container.innerHTML = '<p style="color: red;">메뉴를 불러올 수 없습니다. 오류: ' + error.message + '</p>';
    }
  }
}

function renderMenuSections(menu) {
  const menuContainer = document.getElementById('menu-container');
  if (!menuContainer) return;

  let html = '';

  // 커피 메뉴
  if (menu.coffee && menu.coffee.length > 0) {
    html += createMenuSection('☕ 커피', menu.coffee);
  }

  // 전통차 메뉴
  if (menu['traditional-tea'] && menu['traditional-tea'].length > 0) {
    html += createMenuSection('🍵 전통차', menu['traditional-tea']);
  }

  // 디저트 메뉴
  if (menu.dessert && menu.dessert.length > 0) {
    html += createMenuSection('🍰 디저트', menu.dessert);
  }

  menuContainer.innerHTML = html;
}

function createMenuSection(title, items) {
  let html = `
    <div class="menu-section">
      <h3 class="section-title">${title}</h3>
      <div class="menu-grid">
  `;

  items.forEach(item => {
    html += `
      <div class="menu-item">
        <div class="menu-item-header">
          <span class="menu-item-name">${item.name}</span>
          <span class="menu-item-price">₩${item.price.toLocaleString()}</span>
        </div>
        <p class="menu-item-description">${item.description}</p>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}

// 페이지 로드 시 메뉴 로드
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadMenu);
} else {
  loadMenu();
}
