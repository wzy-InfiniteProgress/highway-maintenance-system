const http = require('http');

// 辅助函数：发送HTTP请求
function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testLogin() {
  console.log('=== 测试用户登录流程 ===\n');

  // 1. 测试admin登录
  console.log('1. 测试admin账户登录:');
  const adminLogin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin123' });

  console.log('   结果:', adminLogin.success ? '✅ 成功' : '❌ 失败');
  if (adminLogin.success) {
    console.log('   Token:', adminLogin.data.token.substring(0, 20) + '...');
    const token = adminLogin.data.token;

    // 2. 测试创建用户
    console.log('\n2. 测试通过API创建用户 test123:');
    const createUser = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      }
    }, {
      username: 'test123',
      email: 'test123@test.com',
      password: 'test123456',
      role: 'viewer'
    });

    console.log('   结果:', createUser.success ? '✅ 成功' : '❌ 失败');
    if (createUser.success) {
      console.log('   用户:', createUser.data.user.username);

      // 3. 测试新用户登录
      console.log('\n3. 测试新创建的用户登录:');
      const testLogin = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { username: 'test123', password: 'test123456' });

      console.log('   结果:', testLogin.success ? '✅ 成功' : '❌ 失败');
      if (testLogin.success) {
        console.log('   用户:', testLogin.data.user.username);
      } else {
        console.log('   错误:', testLogin.error?.message);
      }
    } else {
      console.log('   错误:', createUser.error?.message);
    }
  } else {
    console.log('   错误:', adminLogin.error?.message);
  }
}

testLogin().catch(console.error);