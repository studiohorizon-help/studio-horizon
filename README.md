# Studio Horizon

Studio Horizon의 웹 디자인 스튜디오 홈페이지입니다. 별도 빌드 과정이 없는 정적 HTML·CSS·JavaScript 사이트이며, GitHub Pages에서 `dist/` 폴더를 배포합니다.

## 파일 구성

| 경로 | 역할 |
| --- | --- |
| `dist/index.html` | 페이지 콘텐츠, 검색·공유 메타 정보, 문의 폼 |
| `dist/styles.css` | 색상·간격 변수, 디자인, 반응형 스타일 |
| `dist/script.js` | 모바일 메뉴의 열기·닫기와 키보드 제어 |
| `dist/assets/` | 로고, 아이콘, 프로젝트 이미지 |
| `.github/workflows/deploy-pages.yml` | `main` 반영 시 GitHub Pages 자동 배포 |

## 일상 유지보수

1. 문구·작업 사례·문의 항목은 `dist/index.html`에서 수정합니다.
2. 색상·글꼴·공통 간격은 `dist/styles.css` 상단의 CSS 변수에서 먼저 수정합니다.
3. 새 이미지는 `dist/assets/`에 넣고, HTML의 `src`, `alt`, 이미지 크기를 함께 갱신합니다.
4. 메뉴 기능을 변경할 때는 키보드 Escape 닫기와 `aria-expanded` 상태를 유지합니다.
5. 변경 후에는 내부 링크, 이미지 경로, 모바일 메뉴, 문의 폼 필수 입력값을 확인합니다.

## 문의 폼

문의 폼은 FormSubmit을 통해 `studiohorizon.help@gmail.com`으로 전송됩니다. 이름, 이메일, 연락처, 프로젝트 소개는 모두 필수입니다.

- 수신 주소 변경: `dist/index.html`의 form `action` 주소를 변경합니다.
- 최초 실제 수신: FormSubmit이 보내는 수신 활성화 메일을 `studiohorizon.help@gmail.com`에서 승인합니다.
- 기본 전송 완료 화면은 FormSubmit 페이지입니다. 자체 완료 화면이 필요하면 `dist/thanks.html`을 만든 뒤 `_next` 값을 해당 주소로 설정합니다.

## GitHub Pages 배포

1. 이 폴더의 내용을 GitHub 저장소의 `main` 브랜치에 반영합니다.
2. GitHub 저장소의 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다.
3. Actions의 `Deploy Studio Horizon` 실행이 완료되면 Pages 주소를 확인합니다.

현재 로컬 원격 저장소는 GitHub 주소가 아니므로, 실제 공개 전에는 GitHub 저장소를 원격으로 연결하거나 GitHub에 동일한 파일을 올려야 합니다.

## studiohorizon.kr 도메인 연결

도메인 등록 업체의 DNS를 변경하기 전에, GitHub 저장소의 **Settings → Pages → Custom domain**에 `studiohorizon.kr`을 먼저 저장합니다.

| 유형 | 호스트 | 값 |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME (선택: www) | `www` | `GITHUB-ACCOUNT.github.io` |

- `GITHUB-ACCOUNT`는 실제 GitHub 사용자명 또는 조직명으로 바꿉니다. 저장소명은 넣지 않습니다.
- GitHub Actions 배포에서는 `CNAME` 파일이 필요하지 않습니다.
- DNS 반영과 HTTPS 인증서 발급에는 최대 24시간이 걸릴 수 있습니다. GitHub Pages에서 **Enforce HTTPS**가 표시되면 활성화합니다.
- 와일드카드 DNS(`*`)는 도메인 탈취 위험 때문에 사용하지 않습니다.

공식 참고: [GitHub Pages 배포](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [사용자 도메인 연결](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [HTTPS 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

## 이미지 출처

- `dist/assets/studio-horizon-paper-plane.png`: OpenAI 이미지 생성 도구로 제작한 Studio Horizon 전용 이미지입니다.
- `dist/assets/taebrow-*.png`: Studio Horizon 포트폴리오에 사용하는 TaeBrow 웹사이트 화면 이미지입니다.
