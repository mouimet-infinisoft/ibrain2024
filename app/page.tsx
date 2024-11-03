import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect authenticated users to the protected area
  redirect('/protected');
}