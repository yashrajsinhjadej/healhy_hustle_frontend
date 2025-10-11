import { redirect } from 'next/navigation'

export default function CmsPage() {
  // Redirect to About Us page by default
  redirect('/cms/about')
}
