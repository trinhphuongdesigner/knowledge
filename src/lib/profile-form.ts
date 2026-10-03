/** Đọc các trường hồ sơ từ FormData (dùng chung cho onboarding + trang tài khoản). */
const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

export function profileValuesFromForm(formData: FormData) {
  return {
    name: str(formData.get("name")).trim(),
    fullName: str(formData.get("fullName")).trim(),
    birthYear: str(formData.get("birthYear")).trim(),
    nativeLanguage: str(formData.get("nativeLanguage")),
    gender: str(formData.get("gender")),
    // Checkbox: có gửi (on) = bật, không gửi = tắt.
    useGoogleAvatar: formData.get("useGoogleAvatar") === "on",
  };
}
