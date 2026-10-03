import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONTACT_EMAIL, LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư — Knowledge",
  description: "What data Knowledge collects and how it is used. Knowledge thu thập dữ liệu gì, dùng vào việc gì, chia sẻ với ai, lưu bao lâu và quyền của bạn đối với dữ liệu cá nhân.",
  alternates: { canonical: "/privacy" },
};

const mail = <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>;

const SECTIONS: LegalSection[] = [
  {
    id: "english",
    title: "English summary — Google user data",
    body: (
      <div lang="en" className="space-y-3">
        <p>
          This section summarises, in English, how Knowledge (knowledge.gutanembroidery.com), a flashcard learning web app
          operated by Trinh Phuong, accesses, uses, stores, shares and deletes your data. The full Vietnamese policy below
          has the same content in more detail.
        </p>
        <p>
          <strong>Data we collect from your Google account.</strong> When you choose “Sign in with Google” (via Firebase
          Authentication), Knowledge requests only the basic <code>openid</code>, <code>email</code> and{" "}
          <code>profile</code> scopes and receives: your email address, display name, profile picture URL and Google account
          identifier. We never receive your Google password and we do not request access to Gmail, Google Drive, Contacts,
          Calendar or any other Google data.
        </p>
        <p>
          <strong>Other data we collect.</strong> (1) Profile details you enter yourself: full name, birth year, gender,
          native language, avatar choice, daily study goal and reminder settings. (2) Content you create: study sets, cards
          and files you import (CSV/Excel/Markdown). (3) Learning data: review progress, spaced-repetition schedule, starred
          cards, quiz results, daily statistics, streaks, sets saved from the library and daily AI-suggestion usage count.
          (4) Technical data: a session cookie and browser user agent, IP address and email of sign-in attempts (for rate
          limiting and abuse prevention), and Web Push subscription details if you enable notifications. We do not collect
          location, contacts, biometric or payment data, and we use no third-party advertising trackers.
        </p>
        <p>
          <strong>How we use your data.</strong> Your Google email and account identifier are used only to create your
          account, sign you in and keep your session secure. Your name and profile picture are used only to display your
          profile inside the app (and your display name next to sets you choose to publish in the public library). Other
          data is used to provide the learning features (saving cards, scheduling reviews, statistics, sharing), to send
          in-app and push notifications you turned on, to enforce usage limits and prevent abuse, to moderate public
          content, and to operate and troubleshoot the service. We do <strong>not</strong> sell your data, use it for
          advertising, or use Google user data to train AI or machine-learning models.
        </p>
        <p>
          <strong>Sharing.</strong> Google user data is not shared with third parties except the infrastructure providers
          needed to run the app: Google Firebase Authentication (sign-in), Vercel (hosting) and Supabase (PostgreSQL
          database, Singapore). When you click an AI suggestion, only the word or term you are editing is sent to Anthropic
          — never your email, name or account data. Your email is never shown to other users. We may disclose data if
          required by law.
        </p>
        <p>
          <strong>Storage and protection.</strong> All traffic uses HTTPS. Data is stored in a managed PostgreSQL database
          with access restricted to the operator. Session tokens are stored only as SHA-256 hashes, cookies are{" "}
          <code>HttpOnly</code>, sign-in attempts are rate-limited, write requests are origin-checked, and admin actions are
          audit-logged.
        </p>
        <p>
          <strong>Retention and deletion.</strong> Account, profile, sets and learning progress are kept until you delete
          them or ask us to delete your account. Sign-in logs and AI usage counts are deleted automatically after 30 days,
          daily statistics after about 400 days, and notifications after 30–90 days. You can export all your data as JSON
          from the Account page, revoke Knowledge’s access at{" "}
          <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">
            myaccount.google.com/connections
          </a>
          , and request full account deletion by emailing {mail} from your sign-in address; we delete your account and all
          associated data within 30 days.
        </p>
        <p>
          <strong>Limited Use.</strong> Knowledge’s use and transfer of information received from Google APIs adheres to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
        <p>
          <strong>Contact.</strong> Questions or data requests: {mail}. We reply within 7 business days.
        </p>
      </div>
    ),
  },
  {
    id: "pham-vi",
    title: "Phạm vi áp dụng",
    body: (
      <>
        <p>
          Chính sách này áp dụng cho ứng dụng web Knowledge (kể cả khi cài đặt dưới dạng ứng dụng PWA) — ứng dụng học bằng
          thẻ ghi nhớ do cá nhân Trinh Phuong phát triển và vận hành (sau đây gọi là “chúng tôi”).
        </p>
        <p>
          Khi đăng nhập và sử dụng Knowledge, bạn xác nhận đã đọc và đồng ý với cách chúng tôi xử lý dữ liệu cá nhân như mô
          tả dưới đây. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.
        </p>
      </>
    ),
  },
  {
    id: "du-lieu-thu-thap",
    title: "Dữ liệu chúng tôi thu thập",
    body: (
      <>
        <p>
          <strong>a) Từ tài khoản Google khi bạn đăng nhập</strong> (qua Firebase Authentication): địa chỉ email, tên hiển
          thị, ảnh đại diện và mã định danh tài khoản Google. Chúng tôi <strong>không</strong> nhận mật khẩu Google của bạn
          và không yêu cầu quyền truy cập Gmail, Drive, Danh bạ hay bất kỳ dữ liệu Google nào khác.
        </p>
        <p>
          <strong>b) Thông tin hồ sơ bạn tự khai</strong> khi hoàn tất hồ sơ hoặc trong trang Tài khoản: họ tên, năm sinh,
          giới tính, ngôn ngữ mẹ đẻ, lựa chọn ảnh đại diện, mục tiêu học mỗi ngày và cài đặt nhắc nhở.
        </p>
        <p>
          <strong>c) Nội dung bạn tạo</strong>: nhóm thẻ, thẻ (câu hỏi, đáp án, giải thích, phiên âm…), dữ liệu bạn import
          từ file CSV/Excel/Markdown, chế độ chia sẻ của từng nhóm thẻ.
        </p>
        <p>
          <strong>d) Dữ liệu học tập</strong>: tiến độ lật thẻ, lịch ôn tập (SRS), thẻ đánh sao, kết quả luyện tập, số thẻ
          ôn mỗi ngày, chuỗi ngày học, các bộ thẻ bạn lưu từ thư viện, số lượt dùng gợi ý AI mỗi ngày.
        </p>
        <p>
          <strong>e) Dữ liệu kỹ thuật</strong>:
        </p>
        <ul>
          <li>Cookie phiên đăng nhập và thông tin trình duyệt (user agent) của từng phiên.</li>
          <li>Địa chỉ IP và email của các lần đăng nhập, chỉ để chống dò mật khẩu/lạm dụng (giới hạn số lần đăng nhập).</li>
          <li>
            Thông tin đăng ký thông báo đẩy (endpoint và khoá mã hoá do trình duyệt cấp) — chỉ khi bạn bật thông báo trên
            thiết bị đó.
          </li>
          <li>Thông báo trong ứng dụng gửi tới bạn (nhắc ôn tập, kết quả duyệt bộ thẻ, thông báo hệ thống).</li>
        </ul>
        <p>
          Chúng tôi không thu thập dữ liệu vị trí, danh bạ, dữ liệu sinh trắc học hay dữ liệu thanh toán, và không dùng công
          cụ theo dõi quảng cáo của bên thứ ba.
        </p>
      </>
    ),
  },
  {
    id: "muc-dich",
    title: "Mục đích sử dụng dữ liệu",
    body: (
      <ul>
        <li>Tạo và duy trì tài khoản, xác thực đăng nhập, giữ phiên đăng nhập an toàn.</li>
        <li>Cung cấp các tính năng học: lưu thẻ, xếp lịch ôn tập, thống kê, chuỗi ngày học, thư viện, chia sẻ.</li>
        <li>Gửi thông báo trong ứng dụng và thông báo đẩy mà bạn đã bật (có thể tắt bất cứ lúc nào).</li>
        <li>Cá nhân hoá trải nghiệm (ví dụ: tên và ảnh đại diện trên giao diện, ngôn ngữ mẹ đẻ để gợi ý nghĩa từ).</li>
        <li>Áp dụng hạn mức sử dụng, phát hiện và ngăn chặn lạm dụng, gian lận, truy cập trái phép.</li>
        <li>Kiểm duyệt nội dung được đăng công khai lên thư viện chung.</li>
        <li>Vận hành, sao lưu, khắc phục sự cố và cải thiện dịch vụ dựa trên số liệu tổng hợp.</li>
      </ul>
    ),
  },
  {
    id: "du-lieu-google",
    title: "Dữ liệu nhận từ Google",
    body: (
      <>
        <p>
          Knowledge chỉ yêu cầu các phạm vi cơ bản <code>openid</code>, <code>email</code> và <code>profile</code> để đăng
          nhập. Các dữ liệu này chỉ được dùng để nhận diện tài khoản và hiển thị tên, ảnh đại diện của bạn trong ứng dụng;
          không được bán, không dùng cho quảng cáo, không dùng để huấn luyện mô hình AI và không chuyển cho bên thứ ba ngoài
          các nhà cung cấp hạ tầng nêu ở mục 6.
        </p>
        <p>
          Việc Knowledge sử dụng và chuyển giao thông tin nhận từ Google API tuân thủ{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Chính sách dữ liệu người dùng của Google API Services
          </a>
          , bao gồm các yêu cầu về Sử dụng hạn chế (Limited Use).
        </p>
      </>
    ),
  },
  {
    id: "chia-se",
    title: "Chia sẻ dữ liệu và bên xử lý",
    body: (
      <>
        <p>
          Chúng tôi <strong>không bán</strong> dữ liệu cá nhân. Dữ liệu chỉ được xử lý bởi các nhà cung cấp dịch vụ cần thiết
          để vận hành ứng dụng:
        </p>
        <ul>
          <li>
            <strong>Google Firebase Authentication</strong> — xác thực đăng nhập bằng Google.
          </li>
          <li>
            <strong>Vercel</strong> — lưu trữ và chạy ứng dụng web.
          </li>
          <li>
            <strong>Supabase</strong> — cơ sở dữ liệu PostgreSQL (máy chủ đặt tại Singapore).
          </li>
          <li>
            <strong>Anthropic</strong> — chỉ khi bạn bấm gợi ý bằng AI: chúng tôi gửi duy nhất từ/thuật ngữ bạn đang soạn để
            nhận gợi ý, không kèm email, tên hay dữ liệu tài khoản.
          </li>
          <li>
            <strong>Free Dictionary API (dictionaryapi.dev)</strong> — tra phiên âm, nghĩa của từ tiếng Anh; chỉ gửi từ cần
            tra.
          </li>
          <li>
            <strong>Dịch vụ thông báo đẩy của trình duyệt</strong> (Google, Apple, Mozilla, Microsoft…) — chuyển nội dung
            thông báo tới thiết bị bạn đã bật.
          </li>
        </ul>
        <p>
          <strong>Nội dung bạn chủ động chia sẻ:</strong> nhóm thẻ để chế độ “chia sẻ bằng link” có thể được xem bởi bất kỳ
          ai có link; nhóm thẻ công khai (sau khi được duyệt) hiển thị trong thư viện chung kèm <strong>tên hiển thị</strong>{" "}
          của bạn, và người dùng khác có thể lưu hoặc sao chép để học. Email của bạn không bao giờ hiển thị cho người dùng
          khác.
        </p>
        <p>
          Chúng tôi có thể cung cấp dữ liệu khi có yêu cầu hợp lệ của cơ quan nhà nước có thẩm quyền theo quy định pháp
          luật.
        </p>
      </>
    ),
  },
  {
    id: "chuyen-ra-nuoc-ngoai",
    title: "Lưu trữ và chuyển dữ liệu ra nước ngoài",
    body: (
      <p>
        Các nhà cung cấp nêu trên đặt máy chủ ngoài Việt Nam (như Singapore, Hoa Kỳ). Bằng việc sử dụng dịch vụ, bạn đồng ý
        để dữ liệu được lưu trữ và xử lý tại các quốc gia này. Chúng tôi chỉ chọn nhà cung cấp có biện pháp bảo mật phù hợp
        và chỉ chuyển phần dữ liệu cần thiết cho từng mục đích.
      </p>
    ),
  },
  {
    id: "cookie",
    title: "Cookie và lưu trữ trên thiết bị",
    body: (
      <ul>
        <li>
          <strong>Cookie phiên đăng nhập</strong> (bắt buộc): giữ bạn đăng nhập tối đa 30 ngày kể từ lần dùng gần nhất;
          cookie được đặt chế độ <code>HttpOnly</code>, không đọc được bằng JavaScript.
        </li>
        <li>
          <strong>Bộ nhớ trình duyệt</strong> (localStorage, cache của service worker): lưu giao diện sáng/tối và tài nguyên
          để ứng dụng mở nhanh, dùng được khi offline.
        </li>
        <li>Chúng tôi không dùng cookie quảng cáo hay cookie theo dõi của bên thứ ba.</li>
      </ul>
    ),
  },
  {
    id: "thoi-gian-luu",
    title: "Thời gian lưu trữ",
    body: (
      <>
        <ul>
          <li>Tài khoản, hồ sơ, nhóm thẻ và tiến độ học: lưu cho đến khi bạn xoá hoặc yêu cầu xoá tài khoản.</li>
          <li>Phiên đăng nhập: tự xoá khi hết hạn hoặc khi bạn đăng xuất.</li>
          <li>Lịch sử đăng nhập (IP, email) và số lượt dùng AI: tự động xoá sau 30 ngày.</li>
          <li>Thống kê học theo ngày: tự động xoá sau khoảng 400 ngày.</li>
          <li>Thông báo trong ứng dụng: xoá sau 30 ngày nếu đã đọc, tối đa 90 ngày.</li>
        </ul>
        <p>Bản sao lưu cơ sở dữ liệu (nếu có) được ghi đè theo chu kỳ của nhà cung cấp hạ tầng.</p>
      </>
    ),
  },
  {
    id: "bao-mat",
    title: "Bảo mật",
    body: (
      <>
        <p>
          Mọi kết nối đều qua HTTPS. Mã phiên đăng nhập chỉ nằm trong cookie của bạn; máy chủ chỉ lưu bản băm (SHA-256) nên
          không thể dùng lại kể cả khi cơ sở dữ liệu bị lộ. Đăng nhập có giới hạn số lần thử, các thao tác ghi kiểm tra
          nguồn gốc yêu cầu, và chỉ quản trị viên được truy cập công cụ quản trị (mọi thao tác quản trị đều được ghi nhật
          ký).
        </p>
        <p>
          Không có hệ thống nào an toàn tuyệt đối. Nếu xảy ra sự cố ảnh hưởng tới dữ liệu cá nhân, chúng tôi sẽ thông báo
          cho người dùng bị ảnh hưởng và cơ quan có thẩm quyền theo quy định pháp luật.
        </p>
      </>
    ),
  },
  {
    id: "quyen-cua-ban",
    title: "Quyền của bạn",
    body: (
      <>
        <p>Theo pháp luật Việt Nam về bảo vệ dữ liệu cá nhân, bạn có quyền:</p>
        <ul>
          <li>
            <strong>Được biết và truy cập</strong>: xem toàn bộ hồ sơ và nội dung của bạn trong ứng dụng.
          </li>
          <li>
            <strong>Chỉnh sửa</strong>: cập nhật hồ sơ tại trang <Link href="/account">Tài khoản</Link>; sửa hoặc xoá nhóm
            thẻ bất cứ lúc nào.
          </li>
          <li>
            <strong>Nhận bản sao dữ liệu</strong>: tải toàn bộ dữ liệu của bạn dưới dạng JSON bằng nút xuất dữ liệu trong
            trang Tài khoản; xuất từng nhóm thẻ ra CSV/Excel/Markdown.
          </li>
          <li>
            <strong>Rút lại đồng ý / hạn chế xử lý</strong>: tắt thông báo đẩy, gỡ quyền truy cập của Knowledge tại{" "}
            <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">
              trang quản lý kết nối của tài khoản Google
            </a>
            , hoặc ngừng sử dụng dịch vụ.
          </li>
          <li>
            <strong>Xoá dữ liệu</strong>: gửi yêu cầu xoá tài khoản tới {mail} từ chính email đăng nhập. Chúng tôi xoá tài
            khoản cùng toàn bộ nhóm thẻ, thẻ, tiến độ học và thông báo liên quan trong vòng 30 ngày. Lưu ý: nhóm thẻ công
            khai của bạn cũng bị xoá khỏi thư viện; bản sao mà người khác đã tự tạo trước đó thuộc về tài khoản của họ.
          </li>
          <li>
            <strong>Khiếu nại</strong>: liên hệ với chúng tôi trước; nếu chưa thoả đáng, bạn có thể khiếu nại tới cơ quan
            quản lý nhà nước có thẩm quyền.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "tre-em",
    title: "Trẻ em",
    body: (
      <p>
        Knowledge không dành cho trẻ em dưới 13 tuổi. Người dùng dưới 16 tuổi cần có sự đồng ý của cha mẹ hoặc người giám hộ
        trước khi sử dụng. Nếu bạn là phụ huynh và cho rằng con mình đã cung cấp dữ liệu khi chưa được đồng ý, hãy liên hệ{" "}
        {mail} để chúng tôi xoá.
      </p>
    ),
  },
  {
    id: "thay-doi",
    title: "Thay đổi chính sách",
    body: (
      <p>
        Chúng tôi có thể cập nhật chính sách này khi dịch vụ thay đổi. Ngày cập nhật luôn ghi ở đầu trang; với thay đổi quan
        trọng, chúng tôi sẽ thông báo trong ứng dụng trước khi áp dụng. Tiếp tục sử dụng sau ngày hiệu lực đồng nghĩa với
        việc bạn chấp nhận chính sách mới.
      </p>
    ),
  },
  {
    id: "lien-he",
    title: "Liên hệ",
    body: (
      <p>
        Mọi câu hỏi hoặc yêu cầu về dữ liệu cá nhân, vui lòng gửi email tới {mail}. Chúng tôi phản hồi trong vòng 7 ngày làm
        việc.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Chính sách quyền riêng tư"
      intro={
        <>
          <p>
            Knowledge tôn trọng quyền riêng tư của bạn. Trang này giải thích rõ chúng tôi thu thập dữ liệu gì, dùng vào
            việc gì, chia sẻ với ai, lưu bao lâu và bạn có những quyền gì đối với dữ liệu của mình.
          </p>
          <p lang="en">
            English: see section 1 for a summary of what data Knowledge collects from your Google account and how it is
            used.
          </p>
        </>
      }
      sections={SECTIONS}
    />
  );
}
