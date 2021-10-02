function signIn(){
    let userId = $('#InputEmail').val();
    let userPwd = $('#InputPassword').val();

    $.ajax({
        url: `${window.API_GATEWAY_URI}/auth/v1/login`,
        type: 'POST',
        data: JSON.stringify({
            loginId: userId,
            password: userPwd
        }),
        contentType: 'application/json; charset=UTF-8',
        xhrFields: {
            withCredentials: true
        }
    }).done(function(response){
        firebase.initializeApp(firebaseConfig);
        const messaging = firebase.messaging();
        messaging.requestPermission()
            .then(function() {
                return messaging.getToken();
            })
            .then(async function(token) {
                setUserPushToken(response.data.userId ,token);
            })
    }).fail(function(){
        alert("유효하지 않은 접근입니다. 아이디나 비밀번호를 확인해주세요.");
    });
}

function movRegisterPage(){
    location.href = "/register"
}

function movForgot(){
    location.href="/forgot"
}

const setUserPushToken = (userId, token) => {
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/fcm/v1/user/${userId}?push-token=${token}`,
        type: 'PATCH',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        location.href = "/template";
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

let firebaseConfig = {
    apiKey: "AIzaSyDcO66arFwaWHVYAWpGciqGGQV9cOGJM2Q",
    authDomain: "alarm-1830c.firebaseapp.com",
    projectId: "alarm-1830c",
    storageBucket: "alarm-1830c.appspot.com",
    messagingSenderId: "831418413127",
    appId: "1:831418413127:web:d4fc457e510db7556cc162",
    measurementId: "G-6YP6W2WJ89"
};