import { EditUserForm } from "@/components/edit-user-form"

interface EditUserPageProps {
  params: {
    userId: string
  }
}

export default function EditUserPage({ params }: EditUserPageProps) {
  return <EditUserForm userId={params.userId} />
}

