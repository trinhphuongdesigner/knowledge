import {
  BookOpen,
  CalendarCheck,
  Copy,
  FileUp,
  Gamepad2,
  Languages,
  Library,
  Share2,
  Sparkles,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Container } from "@/components/layout/Container";
import { ButtonLink, Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Giới thiệu — Knowledge",
  description: "Knowledge là ứng dụng học bằng thẻ ghi nhớ: lật thẻ, ôn tập ngắt quãng, quiz, thư viện chung và học offline.",
};

type Feature = { icon: LucideIcon; title: string; body: string };

const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    title: "Thẻ ghi nhớ & nhóm thẻ",
    body: "Tạo nhóm thẻ theo danh mục và cấp độ. Mỗi thẻ có câu hỏi, đáp án, giải thích; hỗ trợ Markdown, đánh sao thẻ khó và theo dõi thẻ đã thuộc.",
  },
  {
    icon: CalendarCheck,
    title: "Ôn tập ngắt quãng (SRS)",
    body: "Hệ thống tự xếp lịch ôn từng thẻ theo mức độ nhớ của bạn. Mục tiêu mỗi ngày, chuỗi ngày học (streak) và thống kê giúp giữ nhịp đều đặn.",
  },
  {
    icon: Gamepad2,
    title: "Nhiều chế độ luyện tập",
    body: "Trắc nghiệm, gõ đáp án, ghép cặp, nghe – chọn và điền chỗ trống. Mỗi chế độ phù hợp một kiểu ghi nhớ khác nhau.",
  },
  {
    icon: Languages,
    title: "Học từ vựng tiếng Anh",
    body: "Danh mục tiếng Anh tự gợi ý phiên âm, từ loại, nghĩa và ví dụ; có nút phát âm. Có thể dùng AI để gợi ý nhanh khi thêm từ.",
  },
  {
    icon: FileUp,
    title: "Import & export",
    body: "Nhập hàng loạt từ CSV, Excel hoặc Markdown (kèm file mẫu và bản xem trước). Xuất nhóm thẻ ra file bất cứ lúc nào.",
  },
  {
    icon: Library,
    title: "Thư viện chung",
    body: "Duyệt các bộ thẻ đã được xuất bản và tìm theo tên hoặc danh mục. Học ngay mà không cần tự soạn từ đầu.",
  },
  {
    icon: Copy,
    title: "Lưu tham chiếu hoặc sao chép",
    body: "Lưu một bộ thẻ vào thư viện của bạn (luôn cập nhật theo bản gốc), hoặc tạo bản sao riêng để tự do chỉnh sửa.",
  },
  {
    icon: Share2,
    title: "Chia sẻ bằng liên kết",
    body: "Mỗi nhóm thẻ có thể để riêng tư, chia sẻ bằng link, hoặc công khai lên thư viện sau khi quản trị viên duyệt.",
  },
  {
    icon: WifiOff,
    title: "Cài như app, học offline",
    body: "Cài lên điện thoại hoặc máy tính như một ứng dụng (PWA). Giao diện sáng/tối, dùng tốt trên mọi kích thước màn hình.",
  },
];

const STEPS = [
  { title: "Tạo hoặc lưu bộ thẻ", body: "Tự soạn, import từ file, hoặc lấy một bộ có sẵn từ thư viện." },
  { title: "Học & luyện tập", body: "Lật thẻ, làm quiz, gõ đáp án — chọn chế độ hợp với bạn." },
  { title: "Ôn đúng lúc", body: "Mỗi ngày mở mục “Ôn hôm nay” để nhớ lâu hơn chỉ với vài phút." },
];

export default async function AboutPage() {
  const user = await getCurrentUser();
  return (
    <Container className="py-8 sm:py-12">
      <section className="mb-10 max-w-2xl sm:mb-14">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-accent-strong">
          <Sparkles className="size-3.5" aria-hidden />
          Giới thiệu
        </p>
        <h1 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">Học nhớ lâu hơn với Knowledge</h1>
        <p className="mt-3 text-base text-ink-600">
          Knowledge là ứng dụng học bằng thẻ ghi nhớ cho kiến thức IT, từ vựng tiếng Anh và bất cứ thứ gì bạn muốn nhớ.
          Soạn thẻ, ôn tập đúng thời điểm, và dùng chung kho bộ thẻ cùng cộng đồng.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {user ? (
            <>
              <ButtonLink href="/">Về trang của tôi</ButtonLink>
              <ButtonLink href="/library" variant="secondary">
                Xem thư viện
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/login">Bắt đầu miễn phí</ButtonLink>
              <ButtonLink href="/login" variant="secondary">
                Đăng nhập
              </ButtonLink>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="features-title" className="mb-12">
        <h2 id="features-title" className="mb-5 text-xl font-semibold text-ink-900">
          Tính năng chính
        </h2>
        <ul className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <li key={title} style={{ "--i": i } as CSSProperties}>
              <Card className="h-full">
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-50 text-accent-strong">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="text-base font-semibold text-ink-900">{title}</h3>
                <p className="mt-1 text-sm text-ink-600">{body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-title">
        <h2 id="steps-title" className="mb-5 text-xl font-semibold text-ink-900">
          Bắt đầu như thế nào?
        </h2>
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full">
                <span className="mb-2 flex size-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-600">{s.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </Container>
  );
}
