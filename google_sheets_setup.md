# 📊 구글 스프레드시트 실시간 연동 가이드

설문 결과를 실시간으로 취합하고, 웹앱 대시보드에 연동하기 위해 아래 설정을 1회 진행해 주세요.

---

## 1단계: 구글 스프레드시트 및 Apps Script 생성
1. [구글 스프레드시트](https://sheets.google.com)로 이동하여 **새 스프레드시트**를 만듭니다.
2. 첫 번째 행에 다음과 같이 열 제목(헤더)을 작성합니다 (생략해도 무방하나 구분용으로 권장합니다):
   - `A1: 타임스탬프` | `B1: 이름` | `C1: 학번` | `D1: 만족도` | `E1: 좋았던 점`
3. 상단 메뉴에서 **[확장 프로그램] -> [Apps Script]**를 클릭합니다.

---

## 2단계: Apps Script 코드 복사 및 붙여넣기
1. Apps Script 편집기 창이 열리면, 기존의 `function myFunction() { ... }` 코드를 모두 지우고 **아래 코드**를 전체 복사하여 붙여넣습니다.

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var data = [];
  
  // 데이터가 헤더 행만 있거나 비어있는 경우 빈 배열 반환
  if (rows.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // 첫 번째 행(헤더)을 제외하고 데이터 추출
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    data.push({
      timestamp: row[0],
      name: row[1],
      studentId: row[2],
      rating: row[3],
      feedback: row[4]
    });
  }
  
  // JSON 형태로 반환 및 CORS 헤더 설정
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // 웹앱에서 POST로 전달된 값 파싱
  var name = e.parameter.name;
  var studentId = e.parameter.studentId;
  var rating = e.parameter.rating;
  var feedback = e.parameter.feedback;
  var timestamp = new Date();
  
  // 시트에 새로운 행 추가
  sheet.appendRow([timestamp, name, studentId, rating, feedback]);
  
  return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}
```

2. 붙여넣기 완료 후 상단의 **저장(디스크 모양 아이콘 💾)**을 누르거나 `Ctrl + S`를 누릅니다.

---

## 3단계: 웹앱 배포 및 권한 설정 (중요)
1. Apps Script 편집기 우측 상단의 **[배포] -> [새 배포]**를 클릭합니다.
2. 좌측 톱니바퀴 모양 아이콘을 눌러 유형을 **[웹앱]**으로 선택합니다.
3. 설정을 다음과 같이 변경합니다:
   - **설명**: `강의 만족도 설문 API` (자유롭게 작성)
   - **웹앱을 실행할 사용자**: `나 (본인 구글 이메일)`
   - **액세스 권한이 있는 사용자**: **`모든 사람 (Anyone)`**  *(※ 중요: 로그인을 요구하지 않고 누구나 보낼 수 있어야 하므로 반드시 모든 사람으로 설정해야 합니다.)*
4. **[배포]** 버튼을 클릭합니다.
5. 최초 배포 시 구글 권한 승인 창이 뜹니다:
   - **[권한 검토 (Authorize Access)]** 클릭 -> 구글 계정 선택
   - **"Google에서 이 앱을 검증하지 않음"** 경고가 나오면 좌측 하단의 **[고급 (Advanced)]** 클릭 -> **`제목 없는 프로젝트(이동) (unsafe)`** 클릭
   - **[허용 (Allow)]** 클릭
6. 배포가 완료되면 생성되는 화면에서 **[웹앱 URL]**을 복사합니다.
   - 주소 형식 예시: `https://script.google.com/macros/s/XXXXX/exec`

---

## 4단계: 웹앱 코드 반영 및 배포
1. 복사한 웹앱 URL을 우리 프로젝트 폴더 내 **[app.js](file:///d:/vibe_works/ex_dy/app.js)** 파일의 **10번째 줄**에 넣어줍니다:
   ```javascript
   // app.js
   const GOOGLE_SCRIPT_URL = '여기에_복사한_웹앱_URL을_붙여넣으세요';
   ```
2. 이제 수정된 코드를 GitHub에 커밋 및 푸시(`git push`)하거나 Vercel에 드래그 앤 드롭하여 최종 배포합니다.
3. 배포된 주소로 학생들이 설문을 제출하면 실시간으로 구글 스프레드시트에 저장되고, 관리자 대시보드에도 실시간 반영됩니다.
