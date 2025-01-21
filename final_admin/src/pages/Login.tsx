import { Form, Input, Button, Typography, Row, Col } from 'antd';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

const { Item } = Form;
const { Title } = Typography;

interface FormType {
  loginId: string;
  password: string;
}

const initialForm: FormType = { loginId: '', password: '' };

export const Login: FC = () => {
  const navigate = useNavigate();
  const onFinish = (values: FormType) => {
    if (!values.loginId) return alert('ID를 적어주세요');
    if (!values.password) return alert('PW를 적어주세요');
    console.log(
      values.loginId === process.env.REACT_APP_ID &&
        values.password === process.env.REACT_APP_PW
    );

    if (
      values.loginId === process.env.REACT_APP_ID &&
      values.password === process.env.REACT_APP_PW
    ) {
      sessionStorage.setItem('user', 'true');
      navigate('/');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
      }}
    >
      <Row justify='center' align='middle' style={{ width: '100%' }}>
        <Col xs={24} sm={18} md={12} lg={8} xl={6}>
          <div
            style={{
              padding: '40px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Title
              level={2}
              style={{ textAlign: 'center', marginBottom: '24px' }}
            >
              로그인
            </Title>
            <Form
              layout='vertical'
              initialValues={initialForm}
              onFinish={onFinish}
            >
              <Item
                label='아이디'
                name='loginId'
                rules={[{ required: true, message: '아이디를 입력하세요' }]}
              >
                <Input placeholder='아이디를 입력하세요' />
              </Item>

              <Item
                label='비밀번호'
                name='password'
                rules={[{ required: true, message: '비밀번호를 입력하세요' }]}
              >
                <Input.Password placeholder='비밀번호를 입력하세요' />
              </Item>

              <Item>
                <Button type='primary' htmlType='submit' size='large' block>
                  로그인
                </Button>
              </Item>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

Login.displayName = 'Login';
