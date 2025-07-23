import LoginClient from "@/components/LoginClient";
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginClient />;
}

export const metadata = {
  title: `Login - ${process.env.NEXT_PUBLIC_APP_NAME}`,
};