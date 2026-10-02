import { Container } from "@/components/layout/Container";
import { PageLoader } from "@/components/ui";

export default function Loading() {
  return (
    <Container className="py-6 sm:py-8">
      <PageLoader label="Đang tải tài khoản…" />
    </Container>
  );
}
