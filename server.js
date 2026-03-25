const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));
app.use(cookieParser());

// 설정 파일 로드
const configPath = path.join(__dirname, 'config.json');
let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.log('config.json을 찾을 수 없습니다. 기본값을 사용합니다.');
  config = { adminPassword: 'admin123' };
}

// 메뉴 데이터 파일 경로
const menuPath = path.join(__dirname, 'data', 'menu.json');

// 메뉴 데이터 로드
function loadMenu() {
  try {
    return JSON.parse(fs.readFileSync(menuPath, 'utf8'));
  } catch (err) {
    console.error('메뉴 로드 실패:', err);
    return { coffee: [], 'traditional-tea': [], dessert: [] };
  }
}

// 메뉴 데이터 저장
function saveMenu(data) {
  try {
    fs.writeFileSync(menuPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('메뉴 저장 실패:', err);
    return false;
  }
}

// 인증 확인 미들웨어
function checkAuth(req, res, next) {
  const isAdmin = req.cookies.isAdmin === 'true';
  if (!isAdmin) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }
  next();
}

// ===== API 엔드포인트 =====

// GET /api/menu - 전체 메뉴 조회
app.get('/api/menu', (req, res) => {
  const menu = loadMenu();
  res.json(menu);
});

// POST /api/auth/login - 로그인
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;

  if (password === config.adminPassword) {
    res.cookie('isAdmin', 'true', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24시간
      sameSite: 'strict'
    });
    res.json({ success: true, message: '로그인 성공' });
  } else {
    res.status(401).json({ success: false, message: '비밀번호가 맞지 않습니다' });
  }
});

// POST /api/auth/logout - 로그아웃
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('isAdmin');
  res.json({ success: true, message: '로그아웃 성공' });
});

// GET /api/auth/check - 인증 상태 확인
app.get('/api/auth/check', (req, res) => {
  const isAdmin = req.cookies.isAdmin === 'true';
  res.json({ isAdmin });
});

// POST /api/menu - 메뉴 항목 추가
app.post('/api/menu', checkAuth, (req, res) => {
  const { name, price, description, category } = req.body;

  if (!name || !price || !description || !category) {
    return res.status(400).json({ error: '모든 필드가 필요합니다' });
  }

  const menu = loadMenu();
  const id = generateId();

  const newItem = { id, name, price: parseInt(price), description };

  if (category === 'coffee') {
    menu.coffee.push(newItem);
  } else if (category === 'traditional-tea') {
    menu['traditional-tea'].push(newItem);
  } else if (category === 'dessert') {
    menu.dessert.push(newItem);
  } else {
    return res.status(400).json({ error: '유효하지 않은 카테고리' });
  }

  if (saveMenu(menu)) {
    res.json({ success: true, id, message: '메뉴 추가 성공' });
  } else {
    res.status(500).json({ error: '저장 실패' });
  }
});

// PUT /api/menu/:id - 메뉴 항목 수정
app.put('/api/menu/:id', checkAuth, (req, res) => {
  const { id } = req.params;
  const { name, price, description, category } = req.body;

  const menu = loadMenu();
  let found = false;

  // 모든 카테고리에서 찾아 수정
  ['coffee', 'traditional-tea', 'dessert'].forEach(cat => {
    const categoryKey = cat === 'traditional-tea' ? 'traditional-tea' : cat;
    const index = menu[categoryKey].findIndex(item => item.id === id);

    if (index !== -1) {
      menu[categoryKey][index] = {
        id,
        name: name || menu[categoryKey][index].name,
        price: price ? parseInt(price) : menu[categoryKey][index].price,
        description: description || menu[categoryKey][index].description
      };
      found = true;
    }
  });

  if (!found) {
    return res.status(404).json({ error: '메뉴를 찾을 수 없습니다' });
  }

  if (saveMenu(menu)) {
    res.json({ success: true, message: '메뉴 수정 성공' });
  } else {
    res.status(500).json({ error: '저장 실패' });
  }
});

// DELETE /api/menu/:id - 메뉴 항목 삭제
app.delete('/api/menu/:id', checkAuth, (req, res) => {
  const { id } = req.params;

  const menu = loadMenu();
  let found = false;

  // 모든 카테고리에서 찾아 삭제
  ['coffee', 'traditional-tea', 'dessert'].forEach(cat => {
    const categoryKey = cat === 'traditional-tea' ? 'traditional-tea' : cat;
    const index = menu[categoryKey].findIndex(item => item.id === id);

    if (index !== -1) {
      menu[categoryKey].splice(index, 1);
      found = true;
    }
  });

  if (!found) {
    return res.status(404).json({ error: '메뉴를 찾을 수 없습니다' });
  }

  if (saveMenu(menu)) {
    res.json({ success: true, message: '메뉴 삭제 성공' });
  } else {
    res.status(500).json({ error: '저장 실패' });
  }
});

// 메뉴 ID 생성 함수
function generateId() {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.random().toString(36).substring(2, 6);
  return `${timestamp}_${random}`;
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
  console.log('메뉴 페이지: http://localhost:3000/menu.html');
  console.log('관리자 페이지: http://localhost:3000/admin.html');
});
