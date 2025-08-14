import nodemailer from 'nodemailer';

// Configuração para usar o Ethereal
// Crie uma conta em https://ethereal.email/
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'dahlia10@ethereal.email',
        pass: 'nvX3w2rdQe6EUc6Ru8'
    }
});

export const sendVerificationEmail = async (to: string, token: string) => {
  // Usaremos uma variável de ambiente para o URL do frontend
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: '"VixRad" <noreply@vixrad.com.br>',
    to: to,
    subject: 'Verifique seu e-mail para ativar sua conta VixRad',
    html: `
      <h1>Bem-vindo ao VixRad!</h1>
      <p>Clique no link abaixo para verificar seu e-mail e ativar sua conta:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail de verificação enviado: %s', info.messageId);
    // Link de preview do e-mail no Ethereal
    console.log('URL de preview: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Erro ao enviar e-mail de verificação:', error);
  }
};