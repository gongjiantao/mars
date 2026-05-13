const nodemailer = require('nodemailer');

/**
 * 发送电子邮件
 * @param {Object} options - 邮件选项
 * @param {String} options.email - 收件人邮箱
 * @param {String} options.subject - 邮件主题
 * @param {String} options.message - 邮件内容（HTML格式）
 */
const sendEmail = async (options) => {
  // 创建测试账号（开发环境）
  let testAccount;
  let transporter;
  
  try {
    if (process.env.NODE_ENV === 'production') {
      // 生产环境使用配置的SMTP服务
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
    } else {
      // 开发环境使用Ethereal测试账号
      testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }
  } catch (error) {
    console.error('创建邮件传输器失败:', error);
    // 创建一个假的传输器，用于开发环境，不实际发送邮件
    transporter = {
      sendMail: (options) => {
        console.log('开发环境模拟发送邮件:', options);
        return Promise.resolve({ messageId: 'test-message-id' });
      }
    };
  }
  
  // 邮件选项
  const mailOptions = {
    from: `${process.env.FROM_NAME || '火星音乐'} <${process.env.FROM_EMAIL || testAccount?.user || 'noreply@marsmusic.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };
  
  // 发送邮件
  const info = await transporter.sendMail(mailOptions);
  
  // 开发环境下输出测试邮件URL
  if (process.env.NODE_ENV !== 'production' && testAccount) {
    console.log('测试邮件URL:', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};

module.exports = sendEmail;