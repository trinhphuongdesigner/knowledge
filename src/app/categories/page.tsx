import type { Metadata } from "next";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { Container } from "@/components/layout/Container";
import { requireUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quản lý danh mục — Knowledge" };

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = await listCategories(user.id);
  return (
    <Container className="max-w-3xl py-6 sm:py-8">
      <CategoryManager initialCategories={categories} />
    </Container>
  );
}
