# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하고 커스터마이징하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [기본 한국어 로컬라이제이션](#기본-한국어-로컬라이제이션)
3. [커스텀 로컬라이제이션](#커스텀-로컬라이제이션)
4. [에러 메시지 커스터마이징](#에러-메시지-커스터마이징)
5. [추가 커스터마이징 옵션](#추가-커스터마이징-옵션)

## 개요

Clerk는 `@clerk/localizations` 패키지를 통해 다양한 언어를 지원합니다. 이 프로젝트는 한국어(`koKR`) 로컬라이제이션을 사용하며, 필요에 따라 커스텀 메시지를 추가할 수 있습니다.

### 지원되는 언어

Clerk는 다음 언어를 지원합니다:
- 한국어 (ko-KR) - `koKR` ✅ 현재 사용 중
- 영어 (en-US) - `enUS`
- 일본어 (ja-JP) - `jaJP`
- 중국어 간체 (zh-CN) - `zhCN`
- 중국어 번체 (zh-TW) - `zhTW`
- 기타 50개 이상의 언어

전체 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization)를 참고하세요.

## 기본 한국어 로컬라이제이션

프로젝트의 `app/layout.tsx`에서 기본 한국어 로컬라이제이션이 적용되어 있습니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

이 설정으로 다음 Clerk 컴포넌트들이 자동으로 한국어로 표시됩니다:
- `<SignIn />` - 로그인 컴포넌트
- `<SignUp />` - 회원가입 컴포넌트
- `<UserButton />` - 사용자 버튼
- `<UserProfile />` - 사용자 프로필
- 기타 모든 Clerk UI 컴포넌트

## 커스텀 로컬라이제이션

기본 한국어 로컬라이제이션을 기반으로 하되, 브랜드에 맞게 메시지를 커스터마이징할 수 있습니다.

### 현재 설정

프로젝트의 `lib/clerk/localization.ts` 파일에서 커스텀 한국어 로컬라이제이션을 정의합니다:

```tsx
import { koKR } from "@clerk/localizations";

export const customKoKR = {
  ...koKR,
  // 에러 메시지 커스터마이징
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "이 이메일 도메인은 접근이 허용되지 않습니다. 접근 권한이 필요하시면 이메일로 문의해주세요.",
  },
};
```

## 에러 메시지 커스터마이징

Clerk의 에러 메시지를 커스터마이징하여 사용자에게 더 친절한 안내를 제공할 수 있습니다.

### 주요 에러 메시지 키

다음은 커스터마이징 가능한 주요 에러 메시지 키입니다:

```tsx
unstable__errors: {
  // 접근 불가
  not_allowed_access: "접근이 허용되지 않습니다.",
  
  // 인증 실패
  form_identifier_not_found: "사용자를 찾을 수 없습니다.",
  form_password_incorrect: "비밀번호가 올바르지 않습니다.",
  
  // 이메일 관련
  form_email_address_invalid: "유효한 이메일 주소를 입력해주세요.",
  form_email_address_exists: "이미 사용 중인 이메일 주소입니다.",
  
  // 비밀번호 관련
  form_password_pwned: "이 비밀번호는 보안상 위험합니다. 다른 비밀번호를 사용해주세요.",
  form_password_length_too_short: "비밀번호가 너무 짧습니다.",
  form_password_length_too_long: "비밀번호가 너무 깁니다.",
  
  // 기타
  form_param_nil: "필수 입력 항목이 누락되었습니다.",
  form_code_incorrect: "인증 코드가 올바르지 않습니다.",
}
```

### 사용 예시

```tsx
import { koKR } from "@clerk/localizations";

export const customKoKR = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    // 접근 불가 에러 메시지 커스터마이징
    not_allowed_access:
      "이 이메일 도메인은 접근이 허용되지 않습니다. 접근 권한이 필요하시면 support@example.com으로 문의해주세요.",
    
    // 비밀번호 에러 메시지 커스터마이징
    form_password_pwned:
      "이 비밀번호는 데이터 유출로 인해 안전하지 않습니다. 더 강력한 비밀번호를 사용해주세요.",
  },
};
```

## 추가 커스터마이징 옵션

### 버튼 텍스트 커스터마이징

폼 버튼의 텍스트를 변경할 수 있습니다:

```tsx
export const customKoKR = {
  ...koKR,
  formButtonPrimary: "시작하기",
  formButtonSecondary: "취소",
  formButtonReset: "초기화",
};
```

### 필드 레이블 커스터마이징

입력 필드의 레이블을 변경할 수 있습니다:

```tsx
export const customKoKR = {
  ...koKR,
  formFieldLabel__emailAddress: "이메일 주소",
  formFieldLabel__password: "비밀번호",
  formFieldLabel__username: "사용자 이름",
};
```

### 제목 및 부제목 커스터마이징

컴포넌트의 제목과 부제목을 변경할 수 있습니다:

```tsx
export const customKoKR = {
  ...koKR,
  signIn: {
    ...koKR.signIn,
    title: "로그인",
    subtitle: "계정에 로그인하세요",
  },
  signUp: {
    ...koKR.signUp,
    title: "회원가입",
    subtitle: "새 계정을 만드세요",
  },
};
```

## 전체 커스터마이징 예시

다음은 더 포괄적인 커스터마이징 예시입니다:

```tsx
import { koKR } from "@clerk/localizations";

export const customKoKR = {
  ...koKR,
  
  // 에러 메시지
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access: "접근 권한이 없습니다. 문의: support@example.com",
    form_password_pwned: "더 강력한 비밀번호를 사용해주세요.",
  },
  
  // 버튼 텍스트
  formButtonPrimary: "확인",
  formButtonSecondary: "취소",
  
  // 로그인 컴포넌트
  signIn: {
    ...koKR.signIn,
    title: "환영합니다",
    subtitle: "계정에 로그인하여 계속하세요",
  },
  
  // 회원가입 컴포넌트
  signUp: {
    ...koKR.signUp,
    title: "시작하기",
    subtitle: "새 계정을 만들어 시작하세요",
  },
};
```

## 적용 방법

1. `lib/clerk/localization.ts` 파일을 수정하여 원하는 메시지를 추가합니다.
2. 변경사항이 자동으로 모든 Clerk 컴포넌트에 적용됩니다.
3. 개발 서버를 재시작할 필요는 없습니다 (Hot Reload 지원).

## 참고 사항

### 실험적 기능

로컬라이제이션 기능은 현재 실험적(experimental) 기능입니다. 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

### Account Portal

로컬라이제이션은 앱 내 Clerk 컴포넌트에만 적용됩니다. 호스팅된 [Clerk Account Portal](https://clerk.com/docs/guides/customizing-clerk/account-portal)은 영어로 유지됩니다.

### 사용 가능한 키 확인

모든 커스터마이징 가능한 키를 확인하려면:
1. `@clerk/localizations` 패키지의 소스 코드를 확인
2. `node_modules/@clerk/localizations/src/locales/en-US.ts` 파일 참조
3. 또는 [Clerk GitHub 저장소](https://github.com/clerk/javascript)에서 확인

## 추가 리소스

- [Clerk 공식 문서 - 로컬라이제이션](https://clerk.com/docs/guides/customizing-clerk/localization)
- [@clerk/localizations 패키지](https://www.npmjs.com/package/@clerk/localizations)
- [Clerk GitHub 저장소](https://github.com/clerk/javascript)

