# VS Code Swagger Agent - 컨텍스트 문서

## 1. 프로젝트 개요

### 기존 프로젝트 (cursor-openapi-agent)
- Spring Boot 컨트롤러의 OpenAPI/Swagger 주석을 자동으로 생성하는 Cursor IDE 전용 도구
- JavaParser를 사용하여 코드를 분석하고, LLM을 통해 최적화된 한국어 주석을 생성/적용
- 주요 기능:
  - 메타데이터 추출 (`/swg-extract`)
  - Swagger 주석 적용 (`/swg-apply`)

### 새 프로젝트 목표 (vscode-swagger-agent)
- VS Code 확장 프로그램으로 재구현
- 실시간 코드 분석 및 주석 제안 기능 추가
- 더 나은 사용자 경험과 팀 협업 지원
- 개발 효율성 극대화

## 2. VS Code 확장 프로그램 설계

### 핵심 기능
1. 실시간 코드 분석
   - 파일 저장 시 자동 분석
   - 코드 변경 감지
   - 증분 분석 지원

2. 스마트 주석 생성
   - GitHub Copilot API 통합
   - 컨텍스트 인식 주석
   - 이전 주석 이력 관리

3. 사용자 인터페이스
   - 사이드바 뷰: API 엔드포인트 트리
   - 웹뷰 패널: Swagger UI 미리보기
   - 코드 렌즈: 주석 업데이트 제안
   - 상태 바: 분석 상태 표시

### 프로젝트 구조
```
vscode-swagger-agent/
├── src/
│   ├── extension.ts        # 확장 진입점
│   ├── analyzer/          # 코드 분석 모듈
│   ├── generators/        # 주석 생성 모듈
│   ├── views/            # UI 컴포넌트
│   └── utils/            # 유틸리티 함수
├── extractor/            # Java 분석기 (기존 코드 재사용)
├── media/               # 리소스
├── package.json
└── README.md
```

### 설정 옵션
```json
{
  "swaggerAgent.autoAnalyze": true,
  "swaggerAgent.analysisDepth": "full|incremental",
  "swaggerAgent.language": "ko|en",
  "swaggerAgent.aiModel": "copilot|gpt4",
  "swaggerAgent.updateTrigger": "onSave|manual"
}
```

## 3. 개발 로드맵

### 1단계: 기본 구조 설정 (1-2주)
- VS Code 확장 프로젝트 설정
- 기존 Java 분석기 통합
- 기본 명령어 구현

### 2단계: 핵심 기능 구현 (2-3주)
- 실시간 코드 분석
- 주석 생성/업데이트
- 기본 UI 구현

### 3단계: UI/UX 개선 (2-3주)
- 사이드바 뷰 구현
- Swagger UI 미리보기
- 설정 페이지

### 4단계: 최적화 및 테스트 (1-2주)
- 성능 최적화
- 버그 수정
- 사용자 피드백 반영

## 4. 최적화 전략

### 성능 최적화
- 증분 분석으로 불필요한 재분석 방지
- AST 캐싱으로 분석 속도 향상
- 백그라운드 작업으로 UI 블로킹 방지

### 사용성 최적화
- 직관적인 UI/UX
- 키보드 단축키 지원
- 커스텀 템플릿 지원

### 협업 기능
- 주석 템플릿 공유
- 팀 설정 동기화
- API 문서 자동 업데이트

## 5. 배포 준비사항

### VS Code 마켓플레이스 등록
1. vsce 도구 설치 및 패키징
2. 마켓플레이스 퍼블리시
3. 문서 작성 (README, CHANGELOG, 사용자 가이드)

### 품질 관리
- VS Code 확장 가이드라인 준수
- 보안 검사
- 성능 테스트
- 사용자 피드백 수집 및 반영

## 6. 주의사항

### 기존 코드 통합
- Java 분석기의 의존성 관리
- 프로세스 간 통신 최적화
- 메모리 사용량 고려

### VS Code API 활용
- 워크스페이스 이벤트 활용
- 리소스 효율적 관리
- 에러 핸들링