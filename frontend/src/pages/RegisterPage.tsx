
import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      await register(values);
    } catch (err: any) {
      setError(err.message || 'Falha no registro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>Registro</Title>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '24px' }} />}
      <Form
        name="register"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Por favor, insira seu Nome Completo!', whitespace: true }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nome Completo" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { type: 'email', message: 'O email inserido não é válido!' },
            { required: true, message: 'Por favor, insira seu Email!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Por favor, insira sua Senha!' }, { min: 6, message: 'A senha deve ter no mínimo 6 caracteres!' }]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Por favor, confirme sua Senha!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('As duas senhas que você digitou não correspondem!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirmar Senha" />
        </Form.Item>

        <Form.Item
          name="cpf"
          rules={[{ required: true, message: 'Por favor, insira seu CPF!' }, { len: 11, message: 'CPF deve ter 11 dígitos!' }]}
        >
          <Input prefix={<IdcardOutlined />} placeholder="CPF (somente números)" maxLength={11} />
        </Form.Item>

        <Form.Item
          name="crm"
          rules={[{ required: true, message: 'Por favor, insira seu CRM!' }]}
        >
          <Input prefix={<IdcardOutlined />} placeholder="CRM" />
        </Form.Item>

        <Form.Item
          name="crmUf"
          rules={[{ required: true, message: 'Por favor, insira a UF do CRM!' }, { len: 2, message: 'UF deve ter 2 caracteres!' }]}
        >
          <Input placeholder="UF do CRM (ex: SP)" maxLength={2} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Registrar
          </Button>
          Já tem uma conta? <a href="/login">Faça login!</a>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterPage;
