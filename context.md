# VS Code Swagger Agent - 컨텍스트 및 현재 상태

이 문서는 `vscode-swagger-agent` 프로젝트의 목적, 지금까지 진행한 작업의 상세 상태, 로컬 빌드/테스트 방법과 남은 작업 항목을 최신 상태로 정리합니다.

## 1. 목표 요약

- Spring Boot 컨트롤러의 OpenAPI/Swagger 주석 생성을 자동화하는 기존 `cursor-openapi-agent`를 VS Code 확장으로 재구현합니다.
- 주요 기능: 실시간 코드 분석, 컨텍스트 기반 주석 생성(LLM 연동), 사이드바/웹뷰/코드렌즈 기반 UX 제공.

## 2. 지금까지 한 작업

- 확장 기본 구조 및 명령 등록
  - `package.json`에 `swagger-agent.analyze`, `swagger-agent.generateAnnotations` 명령 선언
  - `src/extension.ts`에서 명령을 등록하고 핸들러를 `AnalyzerService`에 연결

- extractor 통합 및 빌드
  - 기존 extractor 코드를 `src/extractor`에 위치시킴
  - Gradle wrapper(`./gradlew`)로 빌드하여 `src/extractor/build/libs/swagger-agent-extractor.jar` 생성 확인

- 분석 파이프라인 연결
  - `src/parser/javaParser.ts`: child_process로 extractor JAR 호출하여 JSON 출력 파싱 구현
  - `src/analyzer/analyzerService.ts`: `JavaParser` 호출 및 반환 결과를 처리하도록 구현(현재 내부 콘솔 로깅 및 알림)

- 사이드바(UI) 구현 및 연결
  - `src/views/endpointProvider.ts`: extractor 결과를 받아 컨트롤러/메소드 트리로 렌더링하는 `EndpointProvider` 구현
  - `AnalyzerService`에서 `EndpointProvider`를 주입받아 분석 결과로 트리 갱신

- 로컬 빌드/검증
  - extractor 빌드 성공(로컬) 확인
  - TypeScript 컴파일( `npm run compile`) 확인

- Git 상태
  - 주요 변경사항을 커밋하고 원격 저장소로 푸시(리베이스 충돌 해결 포함)

## 3. 현재 동작 흐름(요약)

1. 사용자가 `Swagger Agent: Analyze Current File` 명령을 실행하거나 `.java` 파일을 저장하면 `extension.ts`의 핸들러가 호출됩니다.
2. `AnalyzerService.analyzeFile`이 호출되며, 내부에서 `JavaParser.parse(documentPath)`로 extractor를 실행합니다.
3. extractor JAR가 Java 파일을 분석하여 JSON을 stdout으로 출력합니다.
4. `JavaParser`가 JSON을 파싱하여 결과를 반환하면 `AnalyzerService`가 이를 받아 `EndpointProvider.updateFromExtractor(result)`로 사이드바를 갱신합니다.

## 4. 로컬에서 재현/빌드 방법(복습)

사전 요구사항
- Java 17
- Node.js + npm

빌드 순서

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

3) 확장 동작 확인

- VS Code에서 워크스페이스를 열고 F5로 Extension Development Host 실행
- Java 파일을 열고 명령 팔레트에서 `Swagger Agent: Analyze Current File` 실행 또는 저장

직접 JAR 실행(디버깅)

```bash
java -jar src/extractor/build/libs/swagger-agent-extractor.jar . src/main/java/your/package/YourController.java
```

## 5. 지금까지 확인된 이슈 / 주의사항

- `java`가 PATH에 있어야 JAR 실행이 가능
- `javaParser.ts`는 JAR의 위치에 의존(현재: `src/extractor/build/libs/swagger-agent-extractor.jar`) — 위치 변경 시 코드 업데이트 필요
- 다수 파일을 연속으로 분석하면 프로세스가 쌓일 수 있으므로 디바운스/큐잉 필요
- extractor가 예상치 못한 stderr를 출력하면 JSON 파싱 실패 가능 — 로깅 개선 필요

## 6. 남은 작업 (우선순위 정리)

우선순위 높은 작업 (1~3)
1. E2E 검증: 예제 Java 컨트롤러 추가 후 `Analyze` → 사이드바에 컨트롤러/메소드 표시되는지 확인 (테스트 케이스 추가)
2. 자동분석 개선: 파일 저장(onSave) 시 디바운스(예: 300ms) 적용, 중복/동시 실행 방지 로직 추가
3. 에러/로깅 강화: stderr/예외를 상세하게 사용자에게 알리고 로그 파일에 기록

중간 우선순위 (4~6)
4. `generateAnnotations` 구현 시작: extractor 출력 → LLM(Pilot/Copilot or OpenAI) 프롬프트 생성 → 변경안 생성 및 미리보기(코드렌즈 또는 편집프리뷰)
5. 전체 스캔(프로젝트) 모드: 다수 파일 스캔 지원 및 증분 분석/캐싱 설계
6. UI 개선: Swagger UI 웹뷰, 상태바 인디케이터, 코드렌즈 제안 등

장기 과제 (7~9)
7. 성능 최적화(캐싱, 백그라운드 작업)
8. 테스트 자동화(유닛/통합 테스트, E2E 시나리오)
9. 마켓플레이스 배포 준비(vsce 패키징, README/CHANGELOG, 보안 점검)