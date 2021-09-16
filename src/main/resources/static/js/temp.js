/**
 * page history UX 개선용
 */
/* 차후 삭제
$(window).on('hashchange', function(){
    if(window.location.hash.slice(1,6) === "forum"){
        let forumId = window.location.hash.slice(7);
        switchFeed(forumId);
    }
});*/



/**
 * 전역 변수들
 */
let deleteForumList = [];

const initData = {
    userData: "",
    forumData: "",
    postData: "",
    userList: "",
    token:"",
    set pushToken(value) {
        this.token = value;
    }
}

const pushTargetUsers = {}


/**
 * ajax 요청들
 */
const userAjax = (prev) => {   // 유저정보 요청
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/user-info`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        initData.userData = data;    // data 저장
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

const userListAjax = (prev) => {   // 유저리스트
    console.log("사용자 리스트 조회");
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/group/users`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        initData.userList = data.list;
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

const forumAjax = (prev) => {  // 포럼 리스트와 기본포럼 정보 요청
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        initData.forumData = data;    // data 저장
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

const postAjax = (prev) => {   // 기본포럼의 피드정보 요청, forumAjax()에 의존적
    const forumId = prev.defaultForum.forumId;
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum/${forumId}/postview`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        initData.postData = data;    // data 저장
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

const onePostAjax = (pid, wrapper) => {  // 특정 포스트 정보 요청 (댓글포함)
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/post/${pid}`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        console.log(data);
        wrapper.data = data.data;    // data 저장
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

const setUserPushToken = (userId, token) => {
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/user/${userId}?push-token=${token}`,
        type: 'PATCH',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        alert("FCM TOKEN INIT Success")
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

const sendPushNotification = (userId, token) => {
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/user/${userId}?push-token=${token}`,
        type: 'PATCH',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        alert("FCM TOKEN INIT Success")
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

/**
 * 초기 랜더링 로직들
 */
const drawFeed = () => {    // 피드리스트 그리는 모듈
    const source = document.querySelector("#feed").innerText;
    let template = Handlebars.compile(source);
    const wrapper = {
        postList: initData.postData.list
    };
    let result = template(wrapper);
    document.querySelector(".container-fluid").innerHTML = result;
}

const forumButton = () => { // 좌측네비 포럼버튼
    const source = document.querySelector("#forum-button").innerText;
    let template = Handlebars.compile(source);
    const wrapper = {
        forumList: initData.forumData.forumList
    };
    let result = template(wrapper);
    document.querySelector(".nav-item > .forum-list").innerHTML = result;
}

const putDefaultForumId = (fId) => {   // 디폴트포럼 아이디 필요한부분 채우기
    document.querySelectorAll(".current-forum-id").forEach((item)=>{
        item.value = fId;
    });
}

const forumDeleteCheckbutton = () => {    // 포럼삭제 체크박스
    const source2 = document.querySelector("#forum-delete-checkbox").innerText;
    let template = Handlebars.compile(source2);
    const wrapper = {
        forumList: initData.forumData.forumList
    };
    result = template(wrapper);
    document.querySelector(".forum-delete-list").innerHTML = result;
}

const drawForum = () => { // 포럼관련 그리는 모듈
    forumButton();
    putDefaultForumId(initData.forumData.defaultForum.forumId);
    forumDeleteCheckbutton();
}

const drawUser = () => {    // 유저프로필 채우는 모듈
    const userProfile = document.querySelectorAll(".login-user-name");
    document.querySelectorAll(".login-user-name").forEach((item)=>{
        item.innerText = initData.userData.data.name;
    });
}

const initDraw = () => {   // 초기데이터로 화면 그리는 function
    console.log("user data: ", initData.userData);
    console.log("forum data: ", initData.forumData);
    console.log("post data: ", initData.postData);
    drawFeed(); // drawForum 보다 먼저 불려야함!
    drawUser();
    drawForum();
    setMentionList(initData.userList, '.comment-input');
}


/* 랜더링 후 부착될 이벤트들 */
const forumDeleteCheckEvent = () => {    // 체크박스 체크/해제 클릭 이벤트
    $('input[name=fList]').off().on('click', function(){
        let ischecked = $(this).is(":checked");
        if(ischecked){
            deleteForumList.push($(this).val());
            //console.log($(this).val());
        }else{
            deleteForumList = deleteForumList.filter((element)=> element !== $(this).val());
            // console.log("배열 원소 삭제 "+$(this).val());
        }
    });
}

const likeButtonEvent = () => {
    $('.like-button').off().on('click', function(){
        let temp = this;
        let postId = temp.parentElement.childNodes[1].value;
        $.ajax({
            url: `${window.API_GATEWAY_URI}/main/v1/like`,
            type: 'POST',
            data: {
                postId: postId,
            },
            xhrFields: {
                withCredentials: true
            }
        }).done(function(data){
            temp.childNodes[1].innerText = data['data'];
        }).fail(function(xhr, status, errorThrown){
            console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
        });
    });
}

// 글작성 버튼 클릭시 서버로 글 데이터를 전송하고 현재 포럼 피드 데이터를 다시 받아와서 피드리스트를 다 갈아치운다
const postCreateEvent = () => {
    $('#post-write-submit').off().on('click', function(){
        let postForm = $('#post-write-form');
        let formData = new FormData(postForm[0]);
        let currentForumId = document.querySelector("#post-write-form")
            .querySelector(".current-forum-id").value;

        // formData 체크용. formdata는 console.log로 확인 불가
        // for (let key of formData.entries()) {
        //     console.log(key[0] + ', ' + key[1])
        // }

        // 작성 글 데이터 전송
        $.ajax({
            url: `${window.API_GATEWAY_URI}/main/v1/post`,
            processData: false, // for multipart, queryString으로 안만들기 위해
            contentType: false, // for multipart, multipart용 contentType 자동지정
            type: 'POST',
            data: formData,
            xhrFields: {
                withCredentials: true
            }
        }).done(function(){
            // 현재포럼 피드 다시 받아오고 재랜더링 (이벤트 다시 다는 과정 포함)
            switchFeed(currentForumId);
        }).fail(function(xhr, status, errorThrown){
            console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
        });
    });
}

// 댓글작성 버튼 클릭시 서버로 댓글 데이터를 전송하고 현재 글 데이터만 다시 받아와서 현재글(댓글포함)을 갈아치운다
const commentCreateEvent = () => {
    $('.comment-write-submit').off().on('click', function(){
        let container = this.parentNode.parentNode.parentNode.parentNode
            .parentNode.parentNode.parentNode;

        let commentForm = container.querySelector(".comment-write-form");
        let formData = new FormData(commentForm)

        // 작성 댓글 데이터 전송
        $.ajax({
            url: `${window.API_GATEWAY_URI}/main/v1/comment`,
            processData: false, // for multipart, queryString으로 안만들기 위해
            contentType: false, // for multipart, multipart용 contentType 자동지정
            type: 'POST',
            data: formData,
            xhrFields: {
                withCredentials: true
            }
        }).done(function(){
            // 현재 글 데이터 다시 받아와서 재랜더링하고 이벤트 다시달기
            let currentPostId = container.querySelector(".current-post-id").value;
            let wrapper = {data: ""};
            onePostAjax(currentPostId, wrapper).done(function(){
                const source = document.querySelector("#one-post").innerText;
                let template = Handlebars.compile(source);
                result = template(wrapper.data);
                container.innerHTML = result;

                switchAddEvent();   // 포럼전환 후 사용하는 모듈 재활용
            });
        }).fail(function(xhr, status, errorThrown){
            console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
        });
    });
}

const initAddEvent = () => {
    forumDeleteCheckEvent();
    likeButtonEvent();
    postCreateEvent();
    commentCreateEvent();
}

const initAjax = () => {    // 초기데이터 불러오고 화면그리는 function
    // forumAjax 응답받은 후 응답데이터 이용해 postAjax 요청
    // userAjax와, forumAjax->postAjax 모두 끝나면 랜더링동작, 이벤트부착동작 실
    $.when(userAjax(),userListAjax(), forumAjax().then(postAjax)).done(() => {
        initDraw(); initAddEvent();
        window.location.hash = `forum/${initData.forumData.defaultForum.forumId}`;  // history UX용
    });
}

initAjax();





/**
 * 버튼동작들
 */
const addForum = () => {
    let forumName = $('#InputForumName').val();

    $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum`,
        type: 'POST',
        data: {
            forumName: forumName,
        },
        xhrFields: {
            withCredentials: true
        }
    }).done(function(){
        location.href = "/template";
    }).fail(function(){
        alert("유효하지 않은 입력이거나, 네트워크 오류가 존재합니다. 다시 시도해주세요.");
    });
}

const deleteForum = () => {
    alert("delte");

    $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum`,
        type: 'DELETE',
        data: {
            forumId: deleteForumList,
        },
        xhrFields: {
            withCredentials: true
        }
    }).done(function(){
        location.href = "/template";
    }).fail(function(){
        alert("유효하지 않은 입력이거나, 네트워크 오류가 존재합니다. 다시 시도해주세요.");
    });
    deleteForumList = [];
}

const logout = () => {
    $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/logout`,
        type: 'POST',
        xhrFields: {
            withCredentials: true
        }
    }).done(function(){
        location.href=`/`;
    }).fail(function(){
        alert("실패하였습니다.");
    });
}


/**
 *  포럼 전환시 동작들
 */
const switchFeedAjax = (fid) => {   // 클릭된 포럼의 피드정보 요청
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum/${fid}/postview`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        initData.postData = data;    // data 저장 (initData 객체 계속 이용)
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

const drawSwitchedFeed = (pList) => {    // 피드리스트 그리는 모듈
    const source = document.querySelector("#feed").innerText;
    let template = Handlebars.compile(source);
    const wrapper = {
        postList: pList
    };
    let result = template(wrapper);
    document.querySelector(".container-fluid").innerHTML = result;
}

const switchAddEvent = () => {
    likeButtonEvent();
    postCreateEvent();
    commentCreateEvent();
}

const switchFeed = (param) => {
    switchFeedAjax(param).done(() => {
        drawSwitchedFeed(initData.postData.list);
        drawUser();
        putDefaultForumId(param);
        switchAddEvent();
        setMentionList(initData.userList, '.comment-input');
        window.location.hash = `forum/${param}`;    // history UX용
    });
}

const setMentionList = (data, target) => {
    $(target).suggest('@', {
        data: data,
        map: function(user) {
            return {
                value: user.name,
                text: '<strong>'+user.name+'</strong> <small>'+user.loginId+'</small> <small hidden>'+user.userId+'</small>'
            }
        },
        onselect: function (e, item){
            const userInfoArr = item.text.split(" ");
            const userId = Number.parseInt(userInfoArr[2]);
            const currentPostId = e.$element.parent().children('.current-post-id').val();

            if(!pushTargetUsers.hasOwnProperty(currentPostId)) {
                pushTargetUsers[currentPostId] = new DeepUserInfoSet();
            }
            if(!pushTargetUsers[currentPostId].has(userId)) {
                pushTargetUsers[currentPostId].add(new UserInformation(userId, userInfoArr[0]));
            }
        }
    });
}

/**
 * 사용 자료 구조 정의
 * */

class UserInformation{
    constructor(userId, userName){
        if(!Number.isInteger(userId)){
            throw new Error("UserPk must be integer");
        }
        if(typeof userName !== 'string'){
            throw new Error("UserName must be string");
        }
        this.userId = userId;
        this.userName = userName;
    }
}

class DeepUserInfoSet extends Set {
    add (o) {
        for (let i of this)
            if (this.deepCompare(o, i))
                return this;
        super.add.call(this, o);
        return this;
    };

    has(userId){
        for(let i of this){
            if(userId === i.userId){
                return true;
            }
        }
        return false;
    };

    deepCompare(o, i) {
        return o.userId === i.userId;
    };
}
