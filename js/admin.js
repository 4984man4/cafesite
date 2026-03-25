let isAdmin = false;
let currentMenu = {};
let editingId = null;

// 페이지 로드 시
document.addEventListener('DOMContentLoaded', async () => {
  isAdmin = await checkAuth();

  if (isAdmin) {
    showAdminDashboard();
    loadMenuList();
    setupEventListeners();
  } else {
    showLoginPage();
    setupLoginForm();
  }
});

// 로그인 페이지 표시
function showLoginPage() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('admin-page').style.display = 'none';
}

// 관리자 대시보드 표시
function showAdminDashboard() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('admin-page').style.display = 'block';
}

// 로그인 폼 설정
function setupLoginForm() {
  const form = document.getElementById('login-form');
  const errorMsg = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;

    const result = await login(password);

    if (result.success) {
      isAdmin = true;
      showAdminDashboard();
      loadMenuList();
      setupEventListeners();
    } else {
      errorMsg.textContent = result.message;
    }
  });
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 메뉴 추가
  document.getElementById('add-menu-form').addEventListener('submit', addMenu);

  // 로그아웃
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// 메뉴 목록 로드
async function loadMenuList() {
  try {
    const response = await fetch('/api/menu');
    currentMenu = await response.json();
    renderMenuList();
  } catch (error) {
    console.error('메뉴 로드 실패:', error);
    document.getElementById('admin-menu-container').innerHTML = '<p>메뉴를 불러올 수 없습니다.</p>';
  }
}

// 메뉴 목록 렌더링
function renderMenuList() {
  const container = document.getElementById('admin-menu-container');
  let html = '';

  const categories = [
    { key: 'coffee', label: '☕ 커피', badgeClass: 'coffee' },
    { key: 'traditional-tea', label: '🍵 전통차', badgeClass: 'tea' },
    { key: 'dessert', label: '🍰 디저트', badgeClass: 'dessert' }
  ];

  categories.forEach(cat => {
    const items = currentMenu[cat.key] || [];

    if (items.length > 0) {
      html += `
        <div class="menu-category">
          <h3>${cat.label}</h3>
          <table class="menu-table">
            <thead>
              <tr>
                <th>메뉴명</th>
                <th>가격</th>
                <th>설명</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
      `;

      items.forEach(item => {
        html += `
          <tr>
            <td><strong>${item.name}</strong></td>
            <td>₩${item.price.toLocaleString()}</td>
            <td>${item.description}</td>
            <td>
              <div class="menu-actions">
                <button class="btn-edit" onclick="openEditModal('${item.id}', '${cat.key}')">수정</button>
                <button class="btn-delete" onclick="deleteMenu('${item.id}')">삭제</button>
              </div>
            </td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    }
  });

  if (!currentMenu.coffee && !currentMenu['traditional-tea'] && !currentMenu.dessert) {
    html = '<p>메뉴가 없습니다.</p>';
  }

  container.innerHTML = html;
}

// 메뉴 추가
async function addMenu(e) {
  e.preventDefault();

  const name = document.getElementById('menu-name').value;
  const price = document.getElementById('menu-price').value;
  const category = document.getElementById('menu-category').value;
  const description = document.getElementById('menu-description').value;

  const messageEl = document.getElementById('add-message');

  try {
    const response = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name,
        price: parseInt(price),
        category,
        description
      })
    });

    const data = await response.json();

    if (response.ok) {
      messageEl.textContent = '✓ 메뉴 추가 성공!';
      messageEl.className = 'message';
      document.getElementById('add-menu-form').reset();

      await loadMenuList();

      setTimeout(() => {
        messageEl.textContent = '';
      }, 2000);
    } else {
      messageEl.textContent = data.error || '추가 실패';
      messageEl.className = 'message error';
    }
  } catch (error) {
    console.error('메뉴 추가 실패:', error);
    messageEl.textContent = '추가 요청 실패';
    messageEl.className = 'message error';
  }
}

// 메뉴 삭제
async function deleteMenu(id) {
  if (!confirm('이 메뉴를 삭제하시겠습니까?')) return;

  try {
    const response = await fetch(`/api/menu/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (response.ok) {
      alert('메뉴가 삭제되었습니다.');
      await loadMenuList();
    } else {
      alert('삭제 실패');
    }
  } catch (error) {
    console.error('메뉴 삭제 실패:', error);
    alert('삭제 요청 실패');
  }
}

// 수정 모달 열기
function openEditModal(id, category) {
  const items = currentMenu[category] || [];
  const item = items.find(i => i.id === id);

  if (!item) return;

  editingId = id;

  // 간단한 인라인 수정 폼
  const newName = prompt('메뉴명:', item.name);
  if (!newName) return;

  const newPrice = prompt('가격:', item.price);
  if (!newPrice) return;

  const newDescription = prompt('설명:', item.description);
  if (!newDescription) return;

  updateMenu(id, newName, parseInt(newPrice), newDescription);
}

// 메뉴 수정
async function updateMenu(id, name, price, description) {
  try {
    const response = await fetch(`/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name,
        price,
        description
      })
    });

    if (response.ok) {
      alert('메뉴가 수정되었습니다.');
      await loadMenuList();
    } else {
      alert('수정 실패');
    }
  } catch (error) {
    console.error('메뉴 수정 실패:', error);
    alert('수정 요청 실패');
  }
}

// 로그아웃
async function handleLogout() {
  if (!confirm('로그아웃하시겠습니까?')) return;

  const result = await logout();
  if (result.success) {
    isAdmin = false;
    location.reload();
  }
}
