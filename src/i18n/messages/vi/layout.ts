const layout = {
  title: "Knowledge — Học bằng flashcard",
  description: "Ôn tập IT và Tiếng Anh với flashcard.",
  footer: {
    about: "Giới thiệu",
    terms: "Điều khoản",
    privacy: "Quyền riêng tư",
    ecosystem: "Hệ sinh thái của Trinh Phuong",
    bongDaTuNhi: "Bóng Đá Tú Nhi",
  },
  header: {
    search: "Tìm kiếm",
    searchTitle: "Tìm kiếm (/)",
    about: "Giới thiệu",
    login: "Đăng nhập",
  },
  theme: {
    label: "Giao diện",
    system: "Hệ thống",
    light: "Sáng",
    dark: "Tối",
  },
  userMenu: {
    account: "Tài khoản",
    review: "Ôn hôm nay",
    library: "Thư viện",
    search: "Tìm kiếm",
    about: "Giới thiệu",
    accountSettings: "Quản lý tài khoản",
    admin: "Quản trị hệ thống",
    signOut: "Đăng xuất",
  },
  install: {
    button: "Cài ứng dụng",
    iosAria: "Hướng dẫn cài ứng dụng trên iPhone",
    iosTitle: "Cài Knowledge trên iPhone",
    step1: "Chạm nút **Chia sẻ** của trình duyệt (hoặc menu **···** → Chia sẻ).",
    step2: "Chọn **Thêm vào MH chính** (Add to Home Screen), rồi bấm **Thêm**.",
    iosNote: "Không thấy \"Thêm vào MH chính\"? Cuộn xuống cuối danh sách chia sẻ, hoặc bấm \"Xem thêm\".",
  },
  offline: "Đang ngoại tuyến. Một số tính năng có thể không dùng được.",
  home: {
    greeting: "Xin chào 👋",
    greetingNamed: "Xin chào, {name} 👋",
    heading: "Hôm nay mình **ôn gì** nhé?",
    subtitle: "Chọn một nhóm thẻ để ôn tập hoặc tạo nhóm thẻ mới.",
    explore: "Khám phá thư viện",
    emptyFilteredTitle: "Không tìm thấy nhóm thẻ phù hợp",
    emptyTitle: "Chưa có nhóm thẻ nào",
    emptyFilteredDescription: "Thử đổi từ khoá hoặc bộ lọc khác.",
    emptyDescription: "Tạo nhóm thẻ đầu tiên để bắt đầu học bằng flashcard.",
    saved: "Thư viện đã lưu",
    inProgress: "Đang học dở",
  },
  about: {
    metaTitle: "Giới thiệu — Knowledge",
    metaDescription:
      "Knowledge là ứng dụng học bằng thẻ ghi nhớ: lật thẻ, ôn tập ngắt quãng, bài kiểm tra, bảng viết tay, thư viện chung và học offline.",
    badge: "Giới thiệu",
    heroTitle: "Học nhớ lâu hơn với Knowledge",
    heroBody:
      "Knowledge là ứng dụng học bằng thẻ ghi nhớ cho kiến thức IT, từ vựng tiếng Anh và bất cứ thứ gì bạn muốn nhớ. Soạn thẻ, ôn tập đúng thời điểm, và dùng chung kho bộ thẻ cùng cộng đồng.",
    ctaHome: "Về trang của tôi",
    ctaLibrary: "Xem thư viện",
    ctaStart: "Bắt đầu miễn phí",
    ctaLogin: "Đăng nhập",
    featuresTitle: "Tính năng chính",
    newBadge: "Mới",
    stepsTitle: "Bắt đầu như thế nào?",
    features: {
      cards: {
        title: "Thẻ ghi nhớ & nhóm thẻ",
        body: "Tạo nhóm thẻ theo danh mục và cấp độ. Mỗi thẻ có câu hỏi, đáp án, giải thích (hỗ trợ Markdown). Xem dạng danh sách chi tiết hoặc dạng thẻ lật, đánh sao thẻ cần chú ý.",
      },
      progress: {
        title: "Học tiếp đúng chỗ",
        body: "Nhóm thẻ đang học dở được đưa lên đầu trang chủ, kèm thanh tiến độ và lời nhắc làm bài kiểm tra khi đã thuộc hết. Học xong một lượt, app gợi ý bước tiếp theo phù hợp.",
      },
      srs: {
        title: "Ôn tập ngắt quãng (SRS)",
        body: "Hệ thống tự xếp lịch ôn từng thẻ theo mức độ nhớ của bạn, ôn bằng lật thẻ hoặc gõ từ. Từ hay quên được đánh dấu “từ khó” và tự gỡ khi bạn đã nhớ ổn định. Tự đặt mục tiêu mỗi ngày, theo dõi chuỗi ngày học và thống kê.",
      },
      modes: {
        title: "Nhiều chế độ luyện tập",
        body: "Trắc nghiệm, gõ đáp án, ghép cặp, nghe – chọn và điền vào chỗ trống. Mỗi chế độ phù hợp một kiểu ghi nhớ khác nhau.",
      },
      vocab: {
        title: "Học từ vựng tiếng Anh",
        body: "Danh mục tiếng Anh tự gợi ý phiên âm, từ loại, nghĩa và ví dụ; có nút phát âm và AI gợi ý nhanh khi thêm từ. Có sẵn bộ thẻ bảng phiên âm IPA: nguyên âm đơn, nguyên âm đôi và phụ âm.",
      },
      board: {
        title: "Bảng viết tay",
        body: "Mở bảng phấn nổi ở bất kỳ trang nào để nháp, luyện viết hay ghi chú bằng chuột, ngón tay hoặc bút. Chọn màu, cỡ nét, khăn lau, hoàn tác và tải về ảnh PNG.",
      },
      importExport: {
        title: "Import & export",
        body: "Nhập hàng loạt từ CSV, Excel hoặc Markdown (kèm file mẫu và bản xem trước). Xuất nhóm thẻ ra file bất cứ lúc nào.",
      },
      library: {
        title: "Thư viện chung",
        body: "Duyệt các bộ thẻ đã được xuất bản và tìm theo tên hoặc danh mục. Học ngay mà không cần tự soạn từ đầu.",
      },
      saveCopy: {
        title: "Lưu tham chiếu hoặc sao chép",
        body: "Lưu một bộ thẻ vào thư viện của bạn (luôn cập nhật theo bản gốc), hoặc tạo bản sao riêng để tự do chỉnh sửa.",
      },
      share: {
        title: "Chia sẻ bằng liên kết",
        body: "Mỗi nhóm thẻ có thể để riêng tư, chia sẻ bằng link, hoặc công khai lên thư viện sau khi quản trị viên duyệt. Link gửi qua mạng xã hội hiện ảnh xem trước kèm logo.",
      },
      reminders: {
        title: "Nhắc học mỗi ngày",
        body: "Bật thông báo đẩy: hôm nào bạn chưa học mà còn thẻ cần ôn, app nhắc một lần vào buổi tối. Bật hoặc tắt bất cứ lúc nào trong cài đặt tài khoản.",
      },
      offline: {
        title: "Cài như app, học offline",
        body: "Cài lên điện thoại hoặc máy tính như một ứng dụng (PWA). Giao diện sáng/tối, dùng tốt trên mọi kích thước màn hình.",
      },
    },
    steps: {
      create: {
        title: "Tạo hoặc lưu bộ thẻ",
        body: "Tự soạn, import từ file, hoặc lấy một bộ có sẵn từ thư viện.",
      },
      study: {
        title: "Học & luyện tập",
        body: "Lật thẻ, đánh dấu thẻ đã thuộc, rồi làm bài kiểm tra để chốt lại kiến thức.",
      },
      review: {
        title: "Ôn đúng lúc",
        body: "Mỗi ngày mở mục “Ôn hôm nay” để nhớ lâu hơn chỉ với vài phút.",
      },
    },
  },
  board: {
    open: "Mở bảng",
    title: "Bảng",
    hasContent: "Bảng đang có nội dung",
    tool: "Công cụ",
    chalk: "Phấn",
    eraser: "Khăn lau",
    colors: "Màu phấn",
    color: { white: "Trắng", yellow: "Vàng", pink: "Hồng", dark: "Đen" },
    size: "Cỡ nét",
    sizes: { xs: "Rất mảnh", s: "Mảnh", m: "Vừa", l: "Đậm" },
    picker: { open: "Chọn màu khác", title: "Chọn màu", sv: "Độ bão hoà và độ sáng", hue: "Sắc màu", hex: "Mã màu", recent: "Màu gần đây" },
    eraserSize: "Cỡ khăn lau",
    background: "Màu bảng",
    bg: { green: "Xanh", black: "Đen", white: "Trắng" },
    undo: "Hoàn tác (Ctrl+Z)",
    clear: "Xoá hết",
    download: "Tải ảnh PNG",
    canvasAria: "Bảng vẽ — viết bằng chuột, ngón tay hoặc bút",
  },
};

export default layout;
