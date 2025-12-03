import { koKR } from "@clerk/localizations";

/**
 * Clerk 한국어 커스텀 로컬라이제이션
 * 
 * 기본 koKR 로컬라이제이션을 기반으로 하되,
 * 브랜드에 맞게 커스터마이징된 한국어 메시지를 제공합니다.
 * 
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */
export const customKoKR = {
  ...koKR,
  // 에러 메시지 커스터마이징
  unstable__errors: {
    ...koKR.unstable__errors,
    // 접근 불가 에러 메시지
    not_allowed_access:
      "이 이메일 도메인은 접근이 허용되지 않습니다. 접근 권한이 필요하시면 이메일로 문의해주세요.",
    // 기타 에러 메시지들을 필요에 따라 추가할 수 있습니다
  },
  // 폼 버튼 텍스트 커스터마이징 (선택사항)
  // formButtonPrimary: "시작하기",
  // formButtonSecondary: "취소",
};

