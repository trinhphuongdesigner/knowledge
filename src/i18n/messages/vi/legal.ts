// Chính sách quyền riêng tư và Điều khoản sử dụng. Quy ước đánh dấu: xem en/legal.ts.
const legal = {
  common: {
    home: "Trang chủ",
    updated: "Cập nhật lần cuối: {date}",
    toc: "Mục lục",
    seeAlso: "Xem thêm:",
    privacy: "Chính sách quyền riêng tư",
    terms: "Điều khoản sử dụng",
    about: "Giới thiệu",
  },
  privacy: {
    metaTitle: "Chính sách quyền riêng tư — Knowledge",
    metaDescription:
      "Knowledge thu thập dữ liệu gì, dùng vào việc gì, chia sẻ với ai, lưu bao lâu và quyền của bạn đối với dữ liệu cá nhân.",
    title: "Chính sách quyền riêng tư",
    intro:
      "Knowledge tôn trọng quyền riêng tư của bạn. Trang này giải thích rõ chúng tôi thu thập dữ liệu gì, dùng vào việc gì, chia sẻ với ai, lưu bao lâu và bạn có những quyền gì đối với dữ liệu của mình.",
    sections: {
      scope: {
        title: "Phạm vi áp dụng",
        p1: "Chính sách này áp dụng cho ứng dụng web Knowledge (kể cả khi cài đặt dưới dạng ứng dụng PWA), truy cập tại knowledge.gutanembroidery.com — ứng dụng học bằng thẻ ghi nhớ do cá nhân Trinh Phuong phát triển và vận hành (sau đây gọi là “chúng tôi”).",
        p2: "Khi đăng nhập và sử dụng Knowledge, bạn xác nhận đã đọc và đồng ý với cách chúng tôi xử lý dữ liệu cá nhân như mô tả dưới đây. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.",
      },
      dataCollected: {
        title: "Dữ liệu chúng tôi thu thập",
        p1: "**a) Từ tài khoản Google khi bạn đăng nhập** (qua Firebase Authentication): địa chỉ email, tên hiển thị, ảnh đại diện và mã định danh tài khoản Google. Chúng tôi chỉ yêu cầu các phạm vi cơ bản `openid`, `email` và `profile`. Chúng tôi **không** nhận mật khẩu Google của bạn và không yêu cầu quyền truy cập Gmail, Drive, Danh bạ, Lịch hay bất kỳ dữ liệu Google nào khác.",
        p2: "**b) Thông tin hồ sơ bạn tự khai** khi hoàn tất hồ sơ hoặc trong trang Tài khoản: họ tên, năm sinh, giới tính, ngôn ngữ mẹ đẻ, lựa chọn ảnh đại diện, mục tiêu học mỗi ngày và cài đặt nhắc nhở.",
        p3: "**c) Nội dung bạn tạo**: nhóm thẻ, thẻ (câu hỏi, đáp án, giải thích, phiên âm…), dữ liệu bạn import từ file CSV/Excel/Markdown, chế độ chia sẻ của từng nhóm thẻ.",
        p4: "**d) Dữ liệu học tập**: tiến độ lật thẻ, lịch ôn tập (SRS), thẻ đánh sao, kết quả luyện tập, số thẻ ôn mỗi ngày, chuỗi ngày học, các bộ thẻ bạn lưu từ thư viện, số lượt dùng gợi ý AI mỗi ngày.",
        p5: "**e) Dữ liệu kỹ thuật**:",
        list: {
          i1: "Cookie phiên đăng nhập và thông tin trình duyệt (user agent) của từng phiên.",
          i2: "Địa chỉ IP và email của các lần đăng nhập, chỉ để chống dò mật khẩu/lạm dụng (giới hạn số lần đăng nhập).",
          i3: "Thông tin đăng ký thông báo đẩy (endpoint và khoá mã hoá do trình duyệt cấp) — chỉ khi bạn bật thông báo trên thiết bị đó.",
          i4: "Thông báo trong ứng dụng gửi tới bạn (nhắc ôn tập, kết quả duyệt bộ thẻ, thông báo hệ thống).",
        },
        p6: "Chúng tôi không thu thập dữ liệu vị trí, danh bạ, dữ liệu sinh trắc học hay dữ liệu thanh toán, và không dùng công cụ theo dõi quảng cáo của bên thứ ba.",
      },
      purposes: {
        title: "Mục đích sử dụng dữ liệu",
        list: {
          i1: "Tạo và duy trì tài khoản, xác thực đăng nhập, giữ phiên đăng nhập an toàn.",
          i2: "Cung cấp các tính năng học: lưu thẻ, xếp lịch ôn tập, thống kê, chuỗi ngày học, thư viện, chia sẻ.",
          i3: "Gửi thông báo trong ứng dụng và thông báo đẩy mà bạn đã bật (có thể tắt bất cứ lúc nào).",
          i4: "Cá nhân hoá trải nghiệm (ví dụ: tên và ảnh đại diện trên giao diện, ngôn ngữ mẹ đẻ để gợi ý nghĩa từ).",
          i5: "Áp dụng hạn mức sử dụng, phát hiện và ngăn chặn lạm dụng, gian lận, truy cập trái phép.",
          i6: "Kiểm duyệt nội dung được đăng công khai lên thư viện chung.",
          i7: "Vận hành, sao lưu, khắc phục sự cố và cải thiện dịch vụ dựa trên số liệu tổng hợp.",
        },
      },
      googleData: {
        title: "Dữ liệu nhận từ Google",
        p1: "Knowledge chỉ yêu cầu các phạm vi cơ bản `openid`, `email` và `profile` để đăng nhập. Các dữ liệu này chỉ được dùng để nhận diện tài khoản và hiển thị tên, ảnh đại diện của bạn trong ứng dụng; không được bán, không dùng cho quảng cáo, không dùng để huấn luyện mô hình AI và không chuyển cho bên thứ ba ngoài các nhà cung cấp hạ tầng nêu ở mục 5.",
        p2: "Việc Knowledge sử dụng và chuyển giao thông tin nhận từ Google API tuân thủ [Chính sách dữ liệu người dùng của Google API Services](googleApiPolicy), bao gồm các yêu cầu về Sử dụng hạn chế (Limited Use).",
      },
      sharing: {
        title: "Chia sẻ dữ liệu và bên xử lý",
        p1: "Chúng tôi **không bán** dữ liệu cá nhân. Dữ liệu chỉ được xử lý bởi các nhà cung cấp dịch vụ cần thiết để vận hành ứng dụng:",
        list: {
          i1: "**Google Firebase Authentication** — xác thực đăng nhập bằng Google.",
          i2: "**Vercel** — lưu trữ và chạy ứng dụng web.",
          i3: "**Supabase** — cơ sở dữ liệu PostgreSQL (máy chủ đặt tại Singapore).",
          i4: "**Anthropic** — chỉ khi bạn bấm gợi ý bằng AI: chúng tôi gửi duy nhất từ/thuật ngữ bạn đang soạn để nhận gợi ý, không kèm email, tên hay dữ liệu tài khoản.",
          i5: "**Free Dictionary API (dictionaryapi.dev)** — tra phiên âm, nghĩa của từ tiếng Anh; chỉ gửi từ cần tra.",
          i6: "**Dịch vụ thông báo đẩy của trình duyệt** (Google, Apple, Mozilla, Microsoft…) — chuyển nội dung thông báo tới thiết bị bạn đã bật.",
        },
        p2: "**Nội dung bạn chủ động chia sẻ:** nhóm thẻ để chế độ “chia sẻ bằng link” có thể được xem bởi bất kỳ ai có link; nhóm thẻ công khai (sau khi được duyệt) hiển thị trong thư viện chung kèm **tên hiển thị** của bạn, và người dùng khác có thể lưu hoặc sao chép để học. Email của bạn không bao giờ hiển thị cho người dùng khác.",
        p3: "Chúng tôi có thể cung cấp dữ liệu khi có yêu cầu hợp lệ của cơ quan nhà nước có thẩm quyền theo quy định pháp luật.",
      },
      international: {
        title: "Lưu trữ và chuyển dữ liệu ra nước ngoài",
        p1: "Các nhà cung cấp nêu trên đặt máy chủ ngoài Việt Nam (như Singapore, Hoa Kỳ). Bằng việc sử dụng dịch vụ, bạn đồng ý để dữ liệu được lưu trữ và xử lý tại các quốc gia này. Chúng tôi chỉ chọn nhà cung cấp có biện pháp bảo mật phù hợp và chỉ chuyển phần dữ liệu cần thiết cho từng mục đích.",
      },
      cookies: {
        title: "Cookie và lưu trữ trên thiết bị",
        list: {
          i1: "**Cookie phiên đăng nhập** (bắt buộc): giữ bạn đăng nhập tối đa 30 ngày kể từ lần dùng gần nhất; cookie được đặt chế độ `HttpOnly`, không đọc được bằng JavaScript.",
          i2: "**Bộ nhớ trình duyệt** (localStorage, cache của service worker): lưu giao diện sáng/tối và tài nguyên để ứng dụng mở nhanh, dùng được khi offline.",
          i3: "Chúng tôi không dùng cookie quảng cáo hay cookie theo dõi của bên thứ ba.",
        },
      },
      retention: {
        title: "Thời gian lưu trữ",
        list: {
          i1: "Tài khoản, hồ sơ, nhóm thẻ và tiến độ học: lưu cho đến khi bạn xoá hoặc yêu cầu xoá tài khoản.",
          i2: "Phiên đăng nhập: tự xoá khi hết hạn hoặc khi bạn đăng xuất.",
          i3: "Lịch sử đăng nhập (IP, email) và số lượt dùng AI: tự động xoá sau 30 ngày.",
          i4: "Thống kê học theo ngày: tự động xoá sau khoảng 400 ngày.",
          i5: "Thông báo trong ứng dụng: xoá sau 30 ngày nếu đã đọc, tối đa 90 ngày.",
        },
        p1: "Bản sao lưu cơ sở dữ liệu (nếu có) được ghi đè theo chu kỳ của nhà cung cấp hạ tầng.",
      },
      security: {
        title: "Bảo mật",
        p1: "Mọi kết nối đều qua HTTPS. Mã phiên đăng nhập chỉ nằm trong cookie của bạn; máy chủ chỉ lưu bản băm (SHA-256) nên không thể dùng lại kể cả khi cơ sở dữ liệu bị lộ. Đăng nhập có giới hạn số lần thử, các thao tác ghi kiểm tra nguồn gốc yêu cầu, và chỉ quản trị viên được truy cập công cụ quản trị (mọi thao tác quản trị đều được ghi nhật ký).",
        p2: "Không có hệ thống nào an toàn tuyệt đối. Nếu xảy ra sự cố ảnh hưởng tới dữ liệu cá nhân, chúng tôi sẽ thông báo cho người dùng bị ảnh hưởng và cơ quan có thẩm quyền theo quy định pháp luật.",
      },
      rights: {
        title: "Quyền của bạn",
        p1: "Theo pháp luật Việt Nam về bảo vệ dữ liệu cá nhân, bạn có quyền:",
        list: {
          i1: "**Được biết và truy cập**: xem toàn bộ hồ sơ và nội dung của bạn trong ứng dụng.",
          i2: "**Chỉnh sửa**: cập nhật hồ sơ tại trang [Tài khoản](account); sửa hoặc xoá nhóm thẻ bất cứ lúc nào.",
          i3: "**Nhận bản sao dữ liệu**: tải toàn bộ dữ liệu của bạn dưới dạng JSON bằng nút xuất dữ liệu trong trang Tài khoản; xuất từng nhóm thẻ ra CSV/Excel/Markdown.",
          i4: "**Rút lại đồng ý / hạn chế xử lý**: tắt thông báo đẩy, gỡ quyền truy cập của Knowledge tại [trang quản lý kết nối của tài khoản Google](googleConnections), hoặc ngừng sử dụng dịch vụ.",
          i5: "**Xoá dữ liệu**: gửi yêu cầu xoá tài khoản tới {mail} từ chính email đăng nhập. Chúng tôi xoá tài khoản cùng toàn bộ nhóm thẻ, thẻ, tiến độ học và thông báo liên quan trong vòng 30 ngày. Lưu ý: nhóm thẻ công khai của bạn cũng bị xoá khỏi thư viện; bản sao mà người khác đã tự tạo trước đó thuộc về tài khoản của họ.",
          i6: "**Khiếu nại**: liên hệ với chúng tôi trước; nếu chưa thoả đáng, bạn có thể khiếu nại tới cơ quan quản lý nhà nước có thẩm quyền.",
        },
      },
      children: {
        title: "Trẻ em",
        p1: "Knowledge không dành cho trẻ em dưới 13 tuổi. Người dùng dưới 16 tuổi cần có sự đồng ý của cha mẹ hoặc người giám hộ trước khi sử dụng. Nếu bạn là phụ huynh và cho rằng con mình đã cung cấp dữ liệu khi chưa được đồng ý, hãy liên hệ {mail} để chúng tôi xoá.",
      },
      changes: {
        title: "Thay đổi chính sách",
        p1: "Chúng tôi có thể cập nhật chính sách này khi dịch vụ thay đổi. Ngày cập nhật luôn ghi ở đầu trang; với thay đổi quan trọng, chúng tôi sẽ thông báo trong ứng dụng trước khi áp dụng. Tiếp tục sử dụng sau ngày hiệu lực đồng nghĩa với việc bạn chấp nhận chính sách mới.",
      },
      contact: {
        title: "Liên hệ",
        p1: "Mọi câu hỏi hoặc yêu cầu về dữ liệu cá nhân, vui lòng gửi email tới {mail}. Chúng tôi phản hồi trong vòng 7 ngày làm việc.",
      },
    },
  },
  terms: {
    metaTitle: "Điều khoản sử dụng — Knowledge",
    metaDescription:
      "Các điều khoản khi sử dụng Knowledge: tài khoản, nội dung người dùng, thư viện chung, quy tắc ứng xử và giới hạn trách nhiệm.",
    title: "Điều khoản sử dụng",
    intro:
      "Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng Knowledge. Điều khoản giúp bạn biết quyền, trách nhiệm của mình và cách chúng tôi vận hành dịch vụ.",
    sections: {
      acceptance: {
        title: "Chấp nhận điều khoản",
        p1: "Knowledge là ứng dụng học bằng thẻ ghi nhớ do cá nhân Trinh Phuong phát triển và vận hành (“chúng tôi”). Khi đăng nhập hoặc sử dụng Knowledge, bạn đồng ý với các Điều khoản sử dụng này và [Chính sách quyền riêng tư](privacy).",
        p2: "Nếu bạn không đồng ý với bất kỳ nội dung nào, vui lòng ngừng sử dụng dịch vụ.",
      },
      account: {
        title: "Tài khoản",
        list: {
          i1: "Bạn đăng nhập bằng tài khoản Google; tài khoản Knowledge được tạo tự động ở lần đăng nhập đầu tiên.",
          i2: "Bạn cần từ đủ 13 tuổi; nếu dưới 16 tuổi, cần có sự đồng ý của cha mẹ hoặc người giám hộ.",
          i3: "Thông tin hồ sơ bạn cung cấp phải trung thực; tên hiển thị không được mạo danh người hay tổ chức khác.",
          i4: "Bạn chịu trách nhiệm bảo vệ tài khoản Google của mình và mọi hoạt động diễn ra dưới tài khoản Knowledge của bạn. Hãy báo ngay cho chúng tôi nếu phát hiện truy cập trái phép.",
        },
      },
      service: {
        title: "Dịch vụ và hạn mức",
        p1: "Knowledge hiện được cung cấp miễn phí. Để đảm bảo công bằng và ổn định, mỗi tài khoản có hạn mức (số nhóm thẻ, số thẻ, số bộ lưu từ thư viện, số lượt gợi ý AI mỗi ngày…). Hạn mức có thể được điều chỉnh theo thời gian.",
        p2: "Chúng tôi có thể thêm, thay đổi hoặc ngừng một tính năng bất kỳ lúc nào. Với thay đổi ảnh hưởng lớn tới dữ liệu của bạn, chúng tôi sẽ cố gắng thông báo trước để bạn kịp xuất dữ liệu.",
      },
      yourContent: {
        title: "Nội dung của bạn",
        p1: "Bạn giữ quyền sở hữu đối với nhóm thẻ và thẻ do mình tạo. Để vận hành dịch vụ, bạn cấp cho chúng tôi quyền lưu trữ, sao lưu, xử lý kỹ thuật và hiển thị nội dung đó cho bạn và cho những người mà bạn chọn chia sẻ.",
        p2: "Mỗi nhóm thẻ có ba chế độ:",
        list: {
          i1: "**Riêng tư**: chỉ bạn xem được.",
          i2: "**Chia sẻ bằng link**: bất kỳ ai có link đều xem được, kể cả khi chưa đăng nhập.",
          i3: "**Công khai**: sau khi quản trị viên duyệt, nhóm thẻ hiển thị trong thư viện chung kèm tên hiển thị của bạn.",
        },
        p3: "Khi chia sẻ bằng link hoặc công khai, bạn đồng ý cho người dùng khác xem, lưu vào thư viện của họ và tạo bản sao để học tập cá nhân, phi thương mại. Bản sao đã tạo thuộc tài khoản của người sao chép và không bị ảnh hưởng khi bạn sửa hoặc xoá bản gốc.",
        p4: "Bạn cam kết có quyền hợp pháp đối với nội dung mình đăng tải (tự soạn, được phép sử dụng, hoặc thuộc phạm vi sử dụng hợp lý) và tự chịu trách nhiệm về nội dung đó.",
      },
      rules: {
        title: "Quy tắc sử dụng",
        p1: "Bạn không được dùng Knowledge để:",
        list: {
          i1: "Đăng nội dung vi phạm pháp luật Việt Nam, xâm phạm quyền sở hữu trí tuệ hoặc quyền riêng tư của người khác.",
          i2: "Đăng nội dung khiêu dâm, bạo lực, thù ghét, phân biệt đối xử, quấy rối, lừa đảo hoặc thông tin sai lệch gây hại.",
          i3: "Đăng dữ liệu cá nhân của người khác (số điện thoại, giấy tờ tuỳ thân, tài khoản…) khi chưa được cho phép.",
          i4: "Phát tán mã độc, spam, quảng cáo trái phép hoặc liên kết lừa đảo.",
          i5: "Truy cập trái phép, dò quét lỗ hổng, vượt hạn mức, thu thập dữ liệu tự động (scraping) hoặc gây quá tải hệ thống.",
          i6: "Mạo danh người khác hoặc quản trị viên.",
        },
      },
      moderation: {
        title: "Kiểm duyệt và xử lý vi phạm",
        p1: "Quản trị viên có quyền duyệt hoặc từ chối nhóm thẻ đăng công khai, gỡ nhóm thẻ khỏi thư viện chung, đánh dấu nhóm thẻ nổi bật, và chuyển nhóm thẻ vi phạm về chế độ không công khai.",
        p2: "Khi phát hiện vi phạm, chúng tôi có thể gỡ nội dung, giới hạn tính năng, **khoá** hoặc **xoá** tài khoản — tuỳ mức độ, có thể không cần báo trước với vi phạm nghiêm trọng. Tài khoản bị khoá sẽ bị đăng xuất khỏi mọi thiết bị và không thể đăng nhập cho tới khi được mở khoá. Nếu cho rằng quyết định chưa đúng, bạn có thể phản hồi qua {mail}.",
        p3: "Danh mục (category) của nhóm thẻ do quản trị viên quản lý chung cho toàn hệ thống.",
      },
      aiDictionary: {
        title: "Gợi ý AI và từ điển",
        p1: "Các gợi ý bằng AI, phiên âm, nghĩa và ví dụ lấy từ dịch vụ bên ngoài chỉ mang tính tham khảo và có thể không chính xác. Bạn nên kiểm tra lại trước khi lưu vào thẻ. Chúng tôi không chịu trách nhiệm về sai sót trong nội dung được gợi ý.",
      },
      intellectualProperty: {
        title: "Sở hữu trí tuệ của Knowledge",
        p1: "Giao diện, mã nguồn, thương hiệu Knowledge và các bộ thẻ mẫu do chúng tôi biên soạn thuộc quyền sở hữu của chúng tôi. Bạn được dùng các bộ thẻ mẫu để học tập cá nhân; không được sao chép hàng loạt, bán lại hoặc phân phối lại cho mục đích thương mại khi chưa được đồng ý bằng văn bản.",
      },
      disclaimer: {
        title: "Miễn trừ bảo đảm",
        p1: "Knowledge được cung cấp “nguyên trạng” và “tuỳ theo khả năng sẵn có”. Chúng tôi nỗ lực giữ dịch vụ ổn định và an toàn nhưng không bảo đảm dịch vụ luôn liên tục, không có lỗi, hay kết quả học tập cụ thể nào. Bạn nên định kỳ xuất dữ liệu quan trọng để tự lưu giữ.",
      },
      liability: {
        title: "Giới hạn trách nhiệm",
        p1: "Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm đối với thiệt hại gián tiếp, ngẫu nhiên hoặc hệ quả (bao gồm mất dữ liệu, gián đoạn học tập) phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ, từ nội dung do người dùng khác đăng tải, hoặc từ dịch vụ của bên thứ ba. Điều này không loại trừ trách nhiệm mà pháp luật không cho phép loại trừ.",
      },
      termination: {
        title: "Chấm dứt sử dụng",
        p1: "Bạn có thể ngừng sử dụng bất cứ lúc nào và yêu cầu xoá tài khoản theo hướng dẫn tại [Chính sách quyền riêng tư](privacyRights). Chúng tôi có thể chấm dứt cung cấp dịch vụ cho tài khoản vi phạm Điều khoản, hoặc ngừng vận hành toàn bộ dịch vụ sau khi thông báo trước hợp lý.",
      },
      changes: {
        title: "Thay đổi điều khoản",
        p1: "Chúng tôi có thể cập nhật Điều khoản này. Ngày cập nhật luôn ghi ở đầu trang; với thay đổi quan trọng, chúng tôi sẽ thông báo trong ứng dụng. Tiếp tục sử dụng sau ngày hiệu lực nghĩa là bạn chấp nhận Điều khoản mới.",
      },
      governingLaw: {
        title: "Luật áp dụng và giải quyết tranh chấp",
        p1: "Điều khoản này được điều chỉnh bởi pháp luật nước Cộng hoà Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp trước hết được giải quyết bằng thương lượng; nếu không thành, tranh chấp sẽ được giải quyết tại cơ quan có thẩm quyền theo quy định pháp luật Việt Nam.",
      },
      contact: {
        title: "Liên hệ",
        p1: "Mọi câu hỏi về Điều khoản sử dụng, vui lòng gửi email tới {mail}.",
      },
    },
  },
};

export default legal;
