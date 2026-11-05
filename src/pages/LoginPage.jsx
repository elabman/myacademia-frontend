import AuthLayout from '../components/AuthLayout'
import LoginForm from '../components/LoginForm'

function LoginPage({ onLogin }) {
  return (
    <AuthLayout>
      <LoginForm onLogin={onLogin} />
    </AuthLayout>
  )
}

export default LoginPage
