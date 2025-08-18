import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Checkbox, Select, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined, SolutionOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import type { LoginCredentials, RegisterUserData } from '../api/authService';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const { Title } = Typography;
const { Option } = Select;

const ufOptions = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { login, register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate(); // Get navigate hook

  const onLoginFinish = async (values: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      await login(values);
      navigate('/app'); // Navigate on successful login
    } catch (err: any) {
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async (values: Omit<RegisterUserData, 'name'> & { name: string; confirm: string; agreement: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const { confirm, agreement, name, ...rest } = values;
      const registerData = { ...rest, name };
      await register(registerData);
      navigate('/app'); // Navigate on successful registration
    } catch (err: any) {
      setError(err.message || 'Falha no registro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '50px', paddingBottom: '50px' }}>
      <Card style={{ width: 450, padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {/* Placeholder for VixRad Logo */}
          <Title level={2} style={{ marginBottom: '0px' }}>VixRad</Title>
          <p>Seu sistema de laudos online</p>
        </div>

        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Button.Group>
            <Button
              type={activeTab === 'login' ? 'primary' : 'default'}
              onClick={() => setActiveTab('login')}
              style={{ width: '150px' }}
            >
              Entrar
            </Button>
            <Button
              type={activeTab === 'register' ? 'primary' : 'default'}
              onClick={() => setActiveTab('register')}
              style={{ width: '150px' }}
            >
              Criar conta
            </Button>
          </Button.Group>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '24px' }} />}

        {activeTab === 'login' ? (
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onLoginFinish}
            scrollToFirstError
            layout="horizontal"
          >
            <Form.Item
              name="email"
              label="E-mail"
              labelCol={{ span: 8, style: { textAlign: 'right' } }}
              wrapperCol={{ span: 16 }}
              rules={[
                { required: true, message: 'Por favor, insira seu Email!' },
                { type: 'email', message: 'Email inválido!' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Senha"
              labelCol={{ span: 8, style: { textAlign: 'right' } }}
              wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: 'Por favor, insira sua Senha!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
            </Form.Item>

            <Form.Item
              name="remember"
              valuePropName="checked"
              wrapperCol={{ offset: 8, span: 16 }}
            >
              <Checkbox>Lembrar-me</Checkbox>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Entrar
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form
            name="register"
            initialValues={{ remember: true }}
            onFinish={onRegisterFinish}
            scrollToFirstError
            layout="horizontal"
          >
            <Form.Item
              name="name"
              label="Nome Completo"
              labelCol={{ span: 8, style: { textAlign: 'right' } }}
              wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: 'Por favor, insira seu Nome Completo!' }]}
            >
              <Input prefix={<SolutionOutlined />} placeholder="Nome Completo" />
            </Form.Item>

            <Form.Item
              name="cpf"
              label="CPF"
              labelCol={{ span: 8, style: { textAlign: 'right' } }}
              wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: 'Por favor, insira seu CPF!' }, { len: 11, message: 'CPF deve ter 11 dígitos!' }]}
            >
              <Input prefix={<SolutionOutlined />} placeholder="CPF" maxLength={11} />
            </Form.Item>

            <Form.Item label="CRM/UF" labelCol={{ span: 8, style: { textAlign: 'right' } }} wrapperCol={{ span: 16 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  name="crm"
                  noStyle
                  rules={[{ required: true, message: 'CRM é obrigatório!' }]}
                >
                  <Input prefix={<SolutionOutlined />} placeholder="CRM" style={{ width: '70%' }} />
                </Form.Item>
                <Form.Item
                  name="crmUf"
                  noStyle
                  rules={[{ required: true, message: 'UF é obrigatória!' }]}
                >
                  <Select placeholder="UF" style={{ width: '30%' }}>
                    {ufOptions.map(uf => (
                      <Option key={uf} value={uf}>{uf}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Space.Compact>
            </Form.Item>

            <Form.Item
              name="email"
              label="E-mail"
              labelCol={{ span: 8, style: { textAlign: 'right' } }}
              wrapperCol={{ span: 16 }}
              rules={[
                { required: true, message: 'Por favor, insira seu Email!' },
                { type: 'email', message: 'Email inválido!' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Senha"
              labelCol={{ span: 8, style: { textAlign: 'right' } }}
              wrapperCol={{ span: 16 }}
              rules={[{ required: true, message: 'Por favor, insira sua Senha!' }, { min: 6, message: 'A senha deve ter no mínimo 6 caracteres!' }]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
            </Form.Item>

            <Form.Item
              name="confirm"
              label="Confirme a senha"
              labelCol={{ span: 8, style: { textAlign: 'right' } }}
              wrapperCol={{ span: 16 }}
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
              name="agreement"
              valuePropName="checked"
              wrapperCol={{ offset: 8, span: 16 }}
              rules={[
                { validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Você deve aceitar os termos de uso')) },
              ]}
            >
              <Checkbox>Concordo com os termos de uso</Checkbox>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<ArrowRightOutlined />}>
                Criar conta
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default AuthPage;