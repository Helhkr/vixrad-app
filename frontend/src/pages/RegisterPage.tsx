
import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Checkbox, Select } from 'antd';
import { UserOutlined, LockOutlined, SolutionOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import type { RegisterUserData } from '../api/authService';

const { Title } = Typography;
const { Option } = Select;

const ufOptions = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: RegisterUserData) => {
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
        initialValues={{ remember: true }}
        onFinish={onFinish}
        scrollToFirstError
        layout="vertical" // Keep vertical layout for labels above inputs
        // Optional: Adjust label and wrapper column spans for better alignment
        // labelCol={{ span: 24 }} // Full width for label
        // wrapperCol={{ span: 24 }} // Full width for input
      >
        <Form.Item
          name="fullName"
          label="Nome Completo"
          rules={[{ required: true, message: 'Por favor, insira seu Nome Completo!' }]}
        >
          <Input prefix={<SolutionOutlined />} placeholder="Nome Completo" />
        </Form.Item>

        <Form.Item
          name="cpf"
          label="CPF"
          rules={[{ required: true, message: 'Por favor, insira seu CPF!' }, { len: 11, message: 'CPF deve ter 11 dígitos!' }]}
        >
          <Input prefix={<SolutionOutlined />} placeholder="CPF" maxLength={11} />
        </Form.Item>

        <Form.Item label="CRM/UF">
          <Input.Group compact style={{ display: 'flex' }}>
            <Form.Item
              name="crm"
              noStyle
              rules={[{ required: true, message: 'CRM é obrigatório!' }]}
            >
              <Input style={{ width: '70%' }} prefix={<SolutionOutlined />} placeholder="CRM" />
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
          </Input.Group>
        </Form.Item>

        <Form.Item
          name="email"
          label="E-mail"
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
          rules={[{ required: true, message: 'Por favor, insira sua Senha!' }, { min: 6, message: 'A senha deve ter no mínimo 6 caracteres!' }]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirme a senha"
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
          rules={[
            { validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Você deve aceitar os termos de uso')) },
          ]}
        >
          <Checkbox>Concordo com os termos de uso</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Registrar
          </Button>
          Já tem uma conta? <Link to="/login">Faça login!</Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterPage;
