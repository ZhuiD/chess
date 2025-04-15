// 检查Clerk密钥的格式
const key = "pk_test_Y291cmFnZW91cy1vcHRpbWlzdC00OC5jbGVyay5hY2NvdW50cy5kZXYk";

// 分离前缀和base64部分
const parts = key.split('_');
if (parts.length !== 3) {
  console.error('密钥格式错误，应该是 pk_test_<base64>');
  process.exit(1);
}

const base64Part = parts[2];
console.log('Base64部分:', base64Part);

// 尝试解码
try {
  const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
  console.log('解码后的值:', decoded);
  console.log('解码成功，格式看起来正确');
} catch (error) {
  console.error('Base64解码失败:', error);
} 