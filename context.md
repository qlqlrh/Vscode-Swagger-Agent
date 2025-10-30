# VS Code Swagger Agent - 컨텍스트 및 현재 상태

이 문서는 `vscode-swagger-agent` 프로젝트의 목적, 설계 요약과 현재까지 작업한 내용(진행 상황), 로컬에서 빌드/테스트하는 방법 및 다음 단계 작업 항목을 정리합니다.

## 1. 목표 요약

- Spring Boot 컨트롤러의 OpenAPI/Swagger 주석 생성을 자동화하는 기존 `cursor-openapi-agent`를 VS Code 확장으로 재구현합니다.
- 주요 기능: 실시간 코드 분석, 컨텍스트 기반 주석 생성(LLM 연동), 사이드바/웹뷰/코드렌즈 기반 UX 제공.

## 2. 지금까지 한 작업(요약)

- VS Code 확장 기본 구조 생성
   - `package.json`, `tsconfig.json` 작성
   - `src/extension.ts` (진입점), `src/analyzer/`, `src/views/` 등 기본 코드 추가

- 기존 Java 분석기(extractor) 통합
   - 원본 `cursor-openapi-agent`의 extractor 핵심 코드를 `src/extractor`로 복사
   - Gradle Wrapper를 사용해 extractor 빌드(로컬에서 `src/extractor/build/libs/swagger-agent-extractor.jar` 생성됨)
   - TypeScript 쪽에서 extractor JAR를 실행하도록 `src/parser/javaParser.ts` 구현
   - `src/analyzer/analyzerService.ts`에서 편집중인 Java 파일 경로를 넘겨 extractor를 호출하도록 연결

- 프로젝트 컴파일/빌드
   - extractor는 `src/extractor/gradlew`로 빌드(로컬에서 성공 확인)
   - 확장 TypeScript는 `npm run compile`로 컴파일 가능

- 버전관리
   - 변경사항을 로컬에서 커밋하고 원격 저장소(https://github.com/qlqlrh/Vscode-Swagger-Agent.git)에 푸시 완료

## 3. 로컬에서 재현/빌드 방법

사전 요구사항
- Java 17 설치(확인됨)
- Node.js + npm (확장 개발용)

빌드 및 테스트 순서

1) extractor 빌드

```bash
cd <workspace-root>/src/extractor
./gradlew clean build -x test
# 생성된 JAR: build/libs/swagger-agent-extractor.jar
```

2) 확장 TypeScript 컴파일

```bash
cd <workspace-root>
npm install
npm run compile
```

3) 확장 개발 실행(권장)

- VS Code에서 이 폴더를 열고 `F5`로 Extension Development Host를 실행합니다.
- 분석을 테스트하려면 Java 파일을 열고 명령 팔레트에서 "Swagger Agent: Analyze Current File" 실행 또는 파일 저장(설정에 따라 자동 분석)

직접 JAR로 테스트 (선택)

```bash
# 예: 워크스페이스 루트에서
java -jar src/extractor/build/libs/swagger-agent-extractor.jar <workspace-root> src/main/java/your/package/YourController.java
```

## 4. 구현 세부(현재 연동 방식)

- `src/parser/javaParser.ts`
   - 확장 내부에서 JavaScript `child_process.spawn('java', ['-jar', jar, workspaceRoot, relativePath])`로 extractor JAR를 호출
   - extractor는 JSON 형태의 메타데이터(EndpointsInfo 등)를 stdout으로 출력하고, 확장은 이를 파싱해 결과를 얻음

- `src/analyzer/analyzerService.ts`
   - 현재는 분석을 트리거하고 결과를 콘솔에 출력 및 성공 알림을 표시하도록 구현되어 있음

- 빌드 아티팩트 위치
   - `<workspace-root>/src/extractor/build/libs/swagger-agent-extractor.jar`

## 5. 확인된 이슈/주의사항

- Gradle이 전역에 없더라도 `src/extractor/gradlew`(wrapper)가 있으므로 로컬 빌드 가능
- extractor 실행시 상대경로 기반으로 대상 파일을 전달하므로, 워크스페이스 루트와 파일 경로 관계가 중요
- 확장에서 JAR를 실행할 때 권한/환경(Path)에 따라 실행 실패 가능 — 실패 시 stderr 내용이 확장 로그에 남음

## 6. 다음 작업

1. 사이드바 뷰(`EndpointProvider`)에 extractor 결과를 렌더링하여 컨트롤러/메소드 트리로 표시 (우선 단일 파일 분석부터)
2. 저장(onSave) 트리거를 통해 자동 분석 결과를 뷰에 반영하도록 연결
3. 주석 생성 파이프라인 설계: extractor 출력 → LLM(예: Copilot) 호출 → 변경안 제시/적용(미리보기/승인 흐름)
4. 에러/로그 개선: 사용자에게 친절한 오류 메시지와 로깅(파일)에 기록
5. 테스트 케이스: 간단한 Java 컨트롤러 예제 추가 후 E2E 검증

## 7. 참고

- 현재 로컬에서 성공적으로 빌드된 JAR 파일: `src/extractor/build/libs/swagger-agent-extractor.jar`
- TypeScript 소스: `src/extension.ts`, `src/analyzer/analyzerService.ts`, `src/parser/javaParser.ts`, `src/views/endpointProvider.ts`