import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONTACT_EMAIL, LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng — Knowledge",
  description: "Các điều khoản khi sử dụng Knowledge: tài khoản, nội dung người dùng, thư viện chung, quy tắc ứng xử và giới hạn trách nhiệm.",
  alternates: { canonical: "/terms" },
};

const mail = <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>;

const SECTIONS: LegalSection[] = [
  {
    id: "chap-nhan",
    title: "Chấp nhận điều khoản",
    body: (
      <>
        <p>
          Knowledge là ứng dụng học bằng thẻ ghi nhớ do cá nhân Trinh Phuong phát triển và vận hành (“chúng tôi”). Khi đăng
          nhập hoặc sử dụng Knowledge, bạn đồng ý với các Điều khoản sử dụng này và{" "}
          <Link href="/privacy">Chính sách quyền riêng tư</Link>.
        </p>
        <p>Nếu bạn không đồng ý với bất kỳ nội dung nào, vui lòng ngừng sử dụng dịch vụ.</p>
      </>
    ),
  },
  {
    id: "tai-khoan",
    title: "Tài khoản",
    body: (
      <ul>
        <li>Bạn đăng nhập bằng tài khoản Google; tài khoản Knowledge được tạo tự động ở lần đăng nhập đầu tiên.</li>
        <li>
          Bạn cần từ đủ 13 tuổi; nếu dưới 16 tuổi, cần có sự đồng ý của cha mẹ hoặc người giám hộ.
        </li>
        <li>Thông tin hồ sơ bạn cung cấp phải trung thực; tên hiển thị không được mạo danh người hay tổ chức khác.</li>
        <li>
          Bạn chịu trách nhiệm bảo vệ tài khoản Google của mình và mọi hoạt động diễn ra dưới tài khoản Knowledge của bạn.
          Hãy báo ngay cho chúng tôi nếu phát hiện truy cập trái phép.
        </li>
      </ul>
    ),
  },
  {
    id: "dich-vu",
    title: "Dịch vụ và hạn mức",
    body: (
      <>
        <p>
          Knowledge hiện được cung cấp miễn phí. Để đảm bảo công bằng và ổn định, mỗi tài khoản có hạn mức (số nhóm thẻ, số
          thẻ, số bộ lưu từ thư viện, số lượt gợi ý AI mỗi ngày…). Hạn mức có thể được điều chỉnh theo thời gian.
        </p>
        <p>
          Chúng tôi có thể thêm, thay đổi hoặc ngừng một tính năng bất kỳ lúc nào. Với thay đổi ảnh hưởng lớn tới dữ liệu của
          bạn, chúng tôi sẽ cố gắng thông báo trước để bạn kịp xuất dữ liệu.
        </p>
      </>
    ),
  },
  {
    id: "noi-dung-cua-ban",
    title: "Nội dung của bạn",
    body: (
      <>
        <p>
          Bạn giữ quyền sở hữu đối với nhóm thẻ và thẻ do mình tạo. Để vận hành dịch vụ, bạn cấp cho chúng tôi quyền lưu
          trữ, sao lưu, xử lý kỹ thuật và hiển thị nội dung đó cho bạn và cho những người mà bạn chọn chia sẻ.
        </p>
        <p>Mỗi nhóm thẻ có ba chế độ:</p>
        <ul>
          <li>
            <strong>Riêng tư</strong>: chỉ bạn xem được.
          </li>
          <li>
            <strong>Chia sẻ bằng link</strong>: bất kỳ ai có link đều xem được, kể cả khi chưa đăng nhập.
          </li>
          <li>
            <strong>Công khai</strong>: sau khi quản trị viên duyệt, nhóm thẻ hiển thị trong thư viện chung kèm tên hiển thị
            của bạn.
          </li>
        </ul>
        <p>
          Khi chia sẻ bằng link hoặc công khai, bạn đồng ý cho người dùng khác xem, lưu vào thư viện của họ và tạo bản sao
          để học tập cá nhân, phi thương mại. Bản sao đã tạo thuộc tài khoản của người sao chép và không bị ảnh hưởng khi bạn
          sửa hoặc xoá bản gốc.
        </p>
        <p>
          Bạn cam kết có quyền hợp pháp đối với nội dung mình đăng tải (tự soạn, được phép sử dụng, hoặc thuộc phạm vi sử
          dụng hợp lý) và tự chịu trách nhiệm về nội dung đó.
        </p>
      </>
    ),
  },
  {
    id: "quy-tac",
    title: "Quy tắc sử dụng",
    body: (
      <>
        <p>Bạn không được dùng Knowledge để:</p>
        <ul>
          <li>Đăng nội dung vi phạm pháp luật Việt Nam, xâm phạm quyền sở hữu trí tuệ hoặc quyền riêng tư của người khác.</li>
          <li>
            Đăng nội dung khiêu dâm, bạo lực, thù ghét, phân biệt đối xử, quấy rối, lừa đảo hoặc thông tin sai lệch gây
            hại.
          </li>
          <li>Đăng dữ liệu cá nhân của người khác (số điện thoại, giấy tờ tuỳ thân, tài khoản…) khi chưa được cho phép.</li>
          <li>Phát tán mã độc, spam, quảng cáo trái phép hoặc liên kết lừa đảo.</li>
          <li>
            Truy cập trái phép, dò quét lỗ hổng, vượt hạn mức, thu thập dữ liệu tự động (scraping) hoặc gây quá tải hệ
            thống.
          </li>
          <li>Mạo danh người khác hoặc quản trị viên.</li>
        </ul>
      </>
    ),
  },
  {
    id: "kiem-duyet",
    title: "Kiểm duyệt và xử lý vi phạm",
    body: (
      <>
        <p>
          Quản trị viên có quyền duyệt hoặc từ chối nhóm thẻ đăng công khai, gỡ nhóm thẻ khỏi thư viện chung, đánh dấu nhóm
          thẻ nổi bật, và chuyển nhóm thẻ vi phạm về chế độ không công khai.
        </p>
        <p>
          Khi phát hiện vi phạm, chúng tôi có thể gỡ nội dung, giới hạn tính năng, <strong>khoá</strong> hoặc{" "}
          <strong>xoá</strong> tài khoản — tuỳ mức độ, có thể không cần báo trước với vi phạm nghiêm trọng. Tài khoản bị khoá
          sẽ bị đăng xuất khỏi mọi thiết bị và không thể đăng nhập cho tới khi được mở khoá. Nếu cho rằng quyết định chưa
          đúng, bạn có thể phản hồi qua {mail}.
        </p>
        <p>Danh mục (category) của nhóm thẻ do quản trị viên quản lý chung cho toàn hệ thống.</p>
      </>
    ),
  },
  {
    id: "ai-tu-dien",
    title: "Gợi ý AI và từ điển",
    body: (
      <p>
        Các gợi ý bằng AI, phiên âm, nghĩa và ví dụ lấy từ dịch vụ bên ngoài chỉ mang tính tham khảo và có thể không chính
        xác. Bạn nên kiểm tra lại trước khi lưu vào thẻ. Chúng tôi không chịu trách nhiệm về sai sót trong nội dung được gợi
        ý.
      </p>
    ),
  },
  {
    id: "so-huu-tri-tue",
    title: "Sở hữu trí tuệ của Knowledge",
    body: (
      <p>
        Giao diện, mã nguồn, thương hiệu Knowledge và các bộ thẻ mẫu do chúng tôi biên soạn thuộc quyền sở hữu của chúng tôi.
        Bạn được dùng các bộ thẻ mẫu để học tập cá nhân; không được sao chép hàng loạt, bán lại hoặc phân phối lại cho mục
        đích thương mại khi chưa được đồng ý bằng văn bản.
      </p>
    ),
  },
  {
    id: "mien-tru",
    title: "Miễn trừ bảo đảm",
    body: (
      <p>
        Knowledge được cung cấp “nguyên trạng” và “tuỳ theo khả năng sẵn có”. Chúng tôi nỗ lực giữ dịch vụ ổn định và an
        toàn nhưng không bảo đảm dịch vụ luôn liên tục, không có lỗi, hay kết quả học tập cụ thể nào. Bạn nên định kỳ xuất
        dữ liệu quan trọng để tự lưu giữ.
      </p>
    ),
  },
  {
    id: "gioi-han",
    title: "Giới hạn trách nhiệm",
    body: (
      <p>
        Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm đối với thiệt hại gián tiếp, ngẫu nhiên hoặc hệ
        quả (bao gồm mất dữ liệu, gián đoạn học tập) phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ, từ nội dung
        do người dùng khác đăng tải, hoặc từ dịch vụ của bên thứ ba. Điều này không loại trừ trách nhiệm mà pháp luật không
        cho phép loại trừ.
      </p>
    ),
  },
  {
    id: "cham-dut",
    title: "Chấm dứt sử dụng",
    body: (
      <p>
        Bạn có thể ngừng sử dụng bất cứ lúc nào và yêu cầu xoá tài khoản theo hướng dẫn tại{" "}
        <Link href="/privacy#quyen-cua-ban">Chính sách quyền riêng tư</Link>. Chúng tôi có thể chấm dứt cung cấp dịch vụ cho
        tài khoản vi phạm Điều khoản, hoặc ngừng vận hành toàn bộ dịch vụ sau khi thông báo trước hợp lý.
      </p>
    ),
  },
  {
    id: "thay-doi",
    title: "Thay đổi điều khoản",
    body: (
      <p>
        Chúng tôi có thể cập nhật Điều khoản này. Ngày cập nhật luôn ghi ở đầu trang; với thay đổi quan trọng, chúng tôi sẽ
        thông báo trong ứng dụng. Tiếp tục sử dụng sau ngày hiệu lực nghĩa là bạn chấp nhận Điều khoản mới.
      </p>
    ),
  },
  {
    id: "luat-ap-dung",
    title: "Luật áp dụng và giải quyết tranh chấp",
    body: (
      <p>
        Điều khoản này được điều chỉnh bởi pháp luật nước Cộng hoà Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp trước hết được
        giải quyết bằng thương lượng; nếu không thành, tranh chấp sẽ được giải quyết tại cơ quan có thẩm quyền theo quy định
        pháp luật Việt Nam.
      </p>
    ),
  },
  {
    id: "lien-he",
    title: "Liên hệ",
    body: <p>Mọi câu hỏi về Điều khoản sử dụng, vui lòng gửi email tới {mail}.</p>,
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Điều khoản sử dụng"
      intro={
        <p>
          Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng Knowledge. Điều khoản giúp bạn biết quyền, trách nhiệm
          của mình và cách chúng tôi vận hành dịch vụ.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
