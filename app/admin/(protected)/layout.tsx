import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: { default: 'Admin LPPM', template: '%s | Admin LPPM' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <AdminSidebar userEmail={user.email ?? ''} />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
