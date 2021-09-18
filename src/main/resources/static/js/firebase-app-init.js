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
messaging.onMessage(payload => {
    console.log(payload.data);
})

/*
* TODO
* 1. 개별 사용자 엔티티에 push_token을 저장하는 API 만든 후 push 토큰 저장.
* 2. 각 message를 받은 이후 알람이 뜨는 영역에 list el을 동적으로 추가한다.
* 3. 알람 뜨는 영역 클릭시 현재까지 있던 사용자의 알람은 모두 Read상태로 바꾸며 다음 로그인 시 더 이상 띄우지 않는다.
* 4. 멘션 혹은 채팅 관련 모듈은 FCM 서버에게 보내, 멘션 혹은 채팅을 받는 사용자의 화면에 동적인 알람을 띄운다.
* */