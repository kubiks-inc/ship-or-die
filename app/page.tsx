import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Kubiks Agent`,
    description: 'Full Stack development platform',
  };
}

export default function Page() {
  redirect('/board');
}
