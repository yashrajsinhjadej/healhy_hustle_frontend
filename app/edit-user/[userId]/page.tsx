import { EditUserForm } from "@/components/User/edit-user-form"

interface EditUserPageProps {
  params: {
    userId: string
  }
}

export default function EditUserPage({ params }: EditUserPageProps) {
  return <EditUserForm userId={params.userId} />
}

