
import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import type { LoginCredentials } from '../api/authService'; // Import LoginCredentials

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      await login(values);
    } catch (err: any) {
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Login</Title>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '24px' }} />}
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Por favor, insira seu Email!' }, { type: 'email', message: 'Email inválido!' }]}
        >
          <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Por favor, insira sua Senha!' }]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Senha"
          />
        </Form.Item>
        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Lembrar-me</Checkbox>
          </Form.Item>

          <a className="login-form-forgot" href="">
            Esqueceu a senha?
          </a>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-form-button" loading={loading} block>
            Entrar
          </Button>
          Ou <a href="/register">registre-se agora!</a>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
