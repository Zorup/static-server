let firebaseConfig = {
    apiKey: "AIzaSyDcO66arFwaWHVYAWpGciqGGQV9cOGJM2Q",
    authDomain: "alarm-1830c.firebaseapp.com",
    projectId: "alarm-1830c",
    storageBucket: "alarm-1830c.appspot.com",
    messagingSenderId: "831418413127",
    appId: "1:831418413127:web:d4fc457e510db7556cc162",
    measurementId: "G-6YP6W2WJ89"
};
//파이어베이스와 페이지를 연결한다. 서비스 워커는 별개로 동작함.
firebase.initializeApp(firebaseConfig);

// 메시지 기능 활성화
const messaging = firebase.messaging();
// RequestPermission 첫 어플 시작 시 알림 허용 or 불허를 사용자가 선택하도록 한다.
messaging.requestPermission()
    .then(function() {
        //앱 연결 시 사용자 기기별 고유한 token값을 준다.
        return messaging.getToken();
    })
    .then(async function(token) {
        console.log(token)
        // 포그라운드 상태에서 FCM을 통해 메시지 전송이 온 경우 이를 수신한다.
        // 서버쪽에서는 토큰기반으로 메시지를 전송 java code에서 보낸 eventmap이 payload.data로 받아짐.
        messaging.onMessage(payload => {
            console.log(payload.data);
        })
    })
