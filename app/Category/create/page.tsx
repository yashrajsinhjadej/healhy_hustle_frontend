import { CreateCategory } from "@/components/Category/Createcategory"

export default function CreateCategoryPage() {
  return (
    <div className="min-h-screen bg-[#f4f5f6] p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Create Category</h1>
        <CreateCategory />
      </div>
    </div>
  )
}
                    