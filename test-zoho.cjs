const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: 'support@cooldrivepro.com',
        pass: 'cXbMicpNVEWa',
      },
    });
    
    // 验证连接
    await transporter.verify();
    console.log('✅ SMTP 连接成功！');
    
    // 发送测试邮件
    const info = await transporter.sendMail({
      from: '"CoolDrivePro Test" <support@cooldrivepro.com>',
      to: 'support@cooldrivepro.com',
      subject: '【测试】Zoho 邮箱配置测试',
      html: `
        <h2>这是一封测试邮件</h2>
        <p>如果你的 Zoho 邮箱收到了这封邮件，说明表单功能配置正确！</p>
        <p>时间: ${new Date().toLocaleString('zh-CN')}</p>
        <hr>
        <p>CoolDrivePro 网站自动测试</p>
      `,
    });
    
    console.log('✅ 测试邮件已发送！');
    console.log('邮件 ID:', info.messageId);
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
  }
}

testEmail();
