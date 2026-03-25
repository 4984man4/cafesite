// 로그인 함수
async function login(password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password }),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      console.log('로그인 성공');
      return { success: true, message: '로그인 성공' };
    } else {
      return { success: false, message: data.message || '로그인 실패' };
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    return { success: false, message: '로그인 요청 실패' };
  }
}

// 로그아웃 함수
async function logout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      console.log('로그아웃 성공');
      return { success: true };
    }
  } catch (error) {
    console.error('로그아웃 오류:', error);
  }
  return { success: false };
}

// 인증 상태 확인
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/check', {
      credentials: 'include'
    });
    const data = await response.json();
    return data.isAdmin || false;
  } catch (error) {
    console.error('인증 확인 오류:', error);
    return false;
  }
}

// 관리자 페이지 보호 (페이지 로드 시 호출)
async function protectAdminPage() {
  const isAdmin = await checkAuth();
  if (!isAdmin) {
    document.body.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>접근 권한이 없습니다.</p><a href="./index.html">홈으로 돌아가기</a></div>';
    throw new Error('관리자 로그인이 필요합니다');
  }
}
